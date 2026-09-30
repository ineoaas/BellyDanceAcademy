package com.bellydanceacademy.notification;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** @param resendApiKey blank in local dev — emails are then logged instead of sent */
@Validated
@ConfigurationProperties("app.mail")
public record MailProperties(String resendApiKey, @NotBlank String from) {
}
