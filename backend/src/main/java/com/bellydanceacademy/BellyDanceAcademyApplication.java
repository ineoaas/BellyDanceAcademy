package com.bellydanceacademy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

/**
 * Belly Dance Academy API — a modular monolith, one package per feature.
 * Authentication is our own session cookie, so Boot's default in-memory
 * user (and its generated password) is switched off.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class BellyDanceAcademyApplication {

    public static void main(String[] args) {
        SpringApplication.run(BellyDanceAcademyApplication.class, args);
    }
}
