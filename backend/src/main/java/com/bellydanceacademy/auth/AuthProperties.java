package com.bellydanceacademy.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("app.auth")
public record AuthProperties(
        @NotNull Duration sessionTtl,
        @NotNull Duration passwordResetTtl,
        @NotBlank String cookieName,
        boolean secureCookie) {
}
