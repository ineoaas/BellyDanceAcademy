package com.bellydanceacademy.common.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import tools.jackson.databind.json.JsonMapper;

/**
 * Throttles the unauthenticated endpoints that are worth abusing: password
 * guessing, account and email spam. Runs before Spring Security so rejected
 * requests are cheap. Disable with {@code app.rate-limit.enabled=false}.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "app.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
class RateLimitConfig {

    private static final RateLimit LOGIN = new RateLimit("login", 20, Duration.ofMinutes(15));
    private static final RateLimit SIGNUP = new RateLimit("signup", 10, Duration.ofHours(1));
    private static final RateLimit PASSWORD_RESET = new RateLimit("password-reset", 5, Duration.ofMinutes(15));
    private static final RateLimit CONTACT = new RateLimit("contact", 5, Duration.ofHours(1));

    private static final Map<String, RateLimit> LIMITS_BY_PATH = Map.of(
            "/api/auth/login", LOGIN,
            "/api/auth/register", SIGNUP,
            "/api/auth/instructor-applications", SIGNUP,
            "/api/auth/password-reset", PASSWORD_RESET,
            "/api/contact", CONTACT);

    /** After the forwarded-headers filter, so the client IP is already resolved. */
    private static final int FILTER_ORDER = Ordered.HIGHEST_PRECEDENCE + 10;

    @Bean
    FixedWindowRateLimiter rateLimiter(Clock clock) {
        return new FixedWindowRateLimiter(clock);
    }

    @Bean
    FilterRegistrationBean<RateLimitFilter> rateLimitFilter(FixedWindowRateLimiter limiter, JsonMapper jsonMapper) {
        var registration = new FilterRegistrationBean<>(new RateLimitFilter(limiter, LIMITS_BY_PATH, jsonMapper));
        registration.setOrder(FILTER_ORDER);
        registration.addUrlPatterns("/api/*");
        return registration;
    }
}
