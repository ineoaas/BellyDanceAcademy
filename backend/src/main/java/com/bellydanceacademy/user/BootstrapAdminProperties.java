package com.bellydanceacademy.user;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

/**
 * Credentials for the first admin account in a fresh deployment. Only used
 * while no admin exists, so they can (and should) be removed from the
 * environment once the admin has signed in and changed the password.
 */
@ConfigurationProperties("app.bootstrap-admin")
public record BootstrapAdminProperties(String name, String email, String password) {

    boolean isConfigured() {
        return StringUtils.hasText(email) && StringUtils.hasText(password);
    }
}
