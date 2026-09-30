package com.bellydanceacademy.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** Turns a valid session cookie into an authenticated SecurityContext. */
class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final SessionService sessionService;
    private final SessionCookies sessionCookies;

    SessionAuthenticationFilter(SessionService sessionService, SessionCookies sessionCookies) {
        this.sessionService = sessionService;
        this.sessionCookies = sessionCookies;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        sessionService.resolve(sessionCookies.read(request)).ifPresent(user -> {
            var authentication = new UsernamePasswordAuthenticationToken(user, null, user.authorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        });
        chain.doFilter(request, response);
    }
}
