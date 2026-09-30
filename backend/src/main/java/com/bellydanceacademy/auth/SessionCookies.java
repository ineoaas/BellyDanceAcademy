package com.bellydanceacademy.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Arrays;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Reads and writes the HttpOnly session cookie. */
@Component
class SessionCookies {

    private final AuthProperties properties;

    SessionCookies(AuthProperties properties) {
        this.properties = properties;
    }

    String read(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> properties.cookieName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    void write(HttpServletResponse response, String rawToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, build(rawToken, properties.sessionTtl()).toString());
    }

    void clear(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, build("", Duration.ZERO).toString());
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(properties.cookieName(), value)
                .httpOnly(true)
                .secure(properties.secureCookie())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
