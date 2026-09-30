package com.bellydanceacademy.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration(proxyBeanMethods = false)
class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    EmailSender emailSender(MailProperties properties, RestClient.Builder restClientBuilder) {
        if (properties.resendApiKey() == null || properties.resendApiKey().isBlank()) {
            log.warn("RESEND_API_KEY is not set — outgoing email will be logged, not delivered");
            return new LoggingEmailSender();
        }
        return new ResendEmailSender(restClientBuilder, properties);
    }
}
