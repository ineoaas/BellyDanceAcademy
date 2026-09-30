package com.bellydanceacademy.common.ratelimit;

import com.bellydanceacademy.common.error.ProblemDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

/**
 * Applies a {@link RateLimit} to specific POST endpoints, per client IP.
 * Rejected requests get a 429 problem response with {@code Retry-After}.
 *
 * <p>The client IP is {@link HttpServletRequest#getRemoteAddr()}, which
 * already reflects {@code X-Forwarded-For} from our own reverse proxy
 * ({@code server.forward-headers-strategy}).
 */
class RateLimitFilter extends OncePerRequestFilter {

    private final FixedWindowRateLimiter limiter;
    private final Map<String, RateLimit> limitsByPath;
    private final JsonMapper jsonMapper;

    RateLimitFilter(FixedWindowRateLimiter limiter, Map<String, RateLimit> limitsByPath, JsonMapper jsonMapper) {
        this.limiter = limiter;
        this.limitsByPath = limitsByPath;
        this.jsonMapper = jsonMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Optional<RateLimit> limit = limitFor(request);
        if (limit.isPresent()) {
            FixedWindowRateLimiter.Decision decision = limiter.tryAcquire(limit.get(), request.getRemoteAddr());
            if (!decision.allowed()) {
                reject(response, decision);
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private Optional<RateLimit> limitFor(HttpServletRequest request) {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return Optional.empty();
        }
        return Optional.ofNullable(limitsByPath.get(request.getRequestURI()));
    }

    private void reject(HttpServletResponse response, FixedWindowRateLimiter.Decision decision) throws IOException {
        long retryAfterSeconds = Math.max(1, decision.retryAfter().toSeconds());
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        jsonMapper.writeValue(response.getOutputStream(), ProblemDetails.of(HttpStatus.TOO_MANY_REQUESTS,
                "RATE_LIMITED", "Too many attempts. Please wait a few minutes and try again."));
    }
}
