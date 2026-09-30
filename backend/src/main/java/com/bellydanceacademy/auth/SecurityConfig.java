package com.bellydanceacademy.auth;

import com.bellydanceacademy.common.error.ProblemDetails;
import com.bellydanceacademy.user.Role;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import tools.jackson.databind.json.JsonMapper;

/**
 * Stateless, cookie-authenticated API for a same-origin SPA.
 *
 * <ul>
 *   <li>Authentication: opaque session cookie → {@link SessionAuthenticationFilter}.</li>
 *   <li>CSRF: double-submit cookie ({@code XSRF-TOKEN} cookie echoed as the
 *       {@code X-XSRF-TOKEN} header). Webhooks are exempt — they're verified by signature.</li>
 *   <li>Authorization: coarse rules per area here; per-endpoint role checks
 *       via {@code @PreAuthorize}; ownership checks in services.</li>
 * </ul>
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http, SessionService sessions, SessionCookies cookies,
                                    JsonMapper jsonMapper) throws Exception {
        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.spa().ignoringRequestMatchers("/api/webhooks/**"))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .addFilterBefore(new SessionAuthenticationFilter(sessions, cookies), AnonymousAuthenticationFilter.class)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, ex) ->
                                writeProblem(response, jsonMapper, HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED",
                                        "Please log in to continue."))
                        .accessDeniedHandler((request, response, ex) ->
                                writeProblem(response, jsonMapper, HttpStatus.FORBIDDEN, "FORBIDDEN",
                                        "You don't have access to this.")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/webhooks/**").permitAll()
                        .requestMatchers("/actuator/health/**", "/api/docs/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/courses/**", "/api/instructors/**", "/api/announcements",
                                "/api/stats", "/api/reviews/featured").permitAll()
                        .requestMatchers("/api/admin/**").hasRole(Role.ADMIN.name())
                        .requestMatchers("/api/instructor/**").hasRole(Role.INSTRUCTOR.name())
                        .anyRequest().authenticated());
        return http.build();
    }

    /** bcrypt by default, with the {id} prefix so the algorithm can be upgraded later. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    private static void writeProblem(HttpServletResponse response, JsonMapper jsonMapper, HttpStatus status,
                                     String code, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        jsonMapper.writeValue(response.getOutputStream(), ProblemDetails.of(status, code, detail));
    }
}
