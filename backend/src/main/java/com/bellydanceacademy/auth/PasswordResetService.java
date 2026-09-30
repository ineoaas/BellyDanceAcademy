package com.bellydanceacademy.auth;

import com.bellydanceacademy.common.error.BusinessRuleException;
import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.time.Clock;
import java.time.Instant;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokens;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher events;
    private final AuthProperties properties;
    private final Clock clock;

    PasswordResetService(PasswordResetTokenRepository tokens, UserRepository users, PasswordEncoder passwordEncoder,
                         ApplicationEventPublisher events, AuthProperties properties, Clock clock) {
        this.tokens = tokens;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.events = events;
        this.properties = properties;
        this.clock = clock;
    }

    /**
     * Silently does nothing for unknown emails — callers always respond the
     * same way so this can't be used to probe who has an account. Issuing a
     * new link invalidates any earlier one.
     */
    @Transactional
    public void requestReset(String email) {
        users.findByEmail(User.normalizeEmail(email)).ifPresent(user -> {
            tokens.deleteAllForUser(user.getId());
            String rawToken = SecureTokens.generate();
            Instant now = clock.instant();
            tokens.save(new PasswordResetToken(SecureTokens.hash(rawToken), user.getId(), now,
                    now.plus(properties.passwordResetTtl())));
            events.publishEvent(new PasswordResetRequested(user.getEmail(), rawToken));
        });
    }

    /** Sets the new password and consumes every outstanding link for that user. */
    @Transactional
    public User resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokens.findById(SecureTokens.hash(rawToken))
                .filter(candidate -> !candidate.isExpired(clock.instant()))
                .orElseThrow(() -> new BusinessRuleException("RESET_TOKEN_INVALID",
                        "That reset link is invalid or has expired. Request a new one."));

        User user = users.findById(token.getUserId()).orElseThrow(() -> new NotFoundException("Account"));
        user.changePasswordHash(passwordEncoder.encode(newPassword));
        tokens.deleteAllForUser(user.getId());
        return user;
    }
}
