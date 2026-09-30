package com.bellydanceacademy.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Settings shared across features. Integration-specific settings live next
 * to the integration that uses them (see {@code MailProperties},
 * {@code StripeProperties}, {@code MuxProperties}).
 */
@Validated
@ConfigurationProperties("app")
public record AppProperties(
        @NotBlank String frontendUrl,
        @NotBlank String adminEmail,
        @NotBlank String currency) {

    /** Absolute link to a frontend route, e.g. {@code frontendLink("/student")}. */
    public String frontendLink(String path) {
        return frontendUrl.replaceAll("/+$", "") + path;
    }
}
