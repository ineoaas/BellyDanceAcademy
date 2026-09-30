package com.bellydanceacademy.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Creates the first admin on startup from {@link BootstrapAdminProperties}.
 * Admins can't sign up through the API, so a fresh production database
 * would otherwise have no way in.
 *
 * <p>Does nothing once any admin exists. A misconfiguration (email owned by
 * a non-admin, password too short) stops startup rather than being
 * silently ignored.
 */
@Component
class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final String DEFAULT_NAME = "Site Admin";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapAdminProperties properties;

    AdminBootstrap(UserRepository users, PasswordEncoder passwordEncoder, BootstrapAdminProperties properties) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.existsByRole(Role.ADMIN)) {
            return;
        }
        if (!properties.isConfigured()) {
            log.warn("No admin account exists. Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD "
                    + "and restart to create one.");
            return;
        }

        String email = User.normalizeEmail(properties.email());
        if (users.existsByEmail(email)) {
            throw new IllegalStateException("Cannot bootstrap admin: " + email + " already belongs to a non-admin account.");
        }
        if (properties.password().length() < PasswordPolicy.MIN_LENGTH) {
            throw new IllegalStateException("Cannot bootstrap admin: " + PasswordPolicy.MESSAGE);
        }

        String name = StringUtils.hasText(properties.name()) ? properties.name() : DEFAULT_NAME;
        users.save(User.newActive(name, email, passwordEncoder.encode(properties.password()), Role.ADMIN));
        log.info("Created bootstrap admin account {}. Remove BOOTSTRAP_ADMIN_PASSWORD from the environment "
                + "and change the password after signing in.", email);
    }
}
