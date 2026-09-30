package com.bellydanceacademy.user;

import com.bellydanceacademy.common.error.BusinessRuleException;
import com.bellydanceacademy.common.error.ConflictException;
import com.bellydanceacademy.common.error.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Self-service changes a signed-in user makes to their own account. */
@Service
public class AccountService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    AccountService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User updateProfile(Long userId, String name, String email) {
        User user = load(userId);
        String normalizedEmail = User.normalizeEmail(email);
        users.findByEmail(normalizedEmail)
                .filter(other -> !other.getId().equals(userId))
                .ifPresent(other -> {
                    throw new ConflictException("EMAIL_TAKEN", "That email is already in use by another account.");
                });
        user.updateProfile(name, normalizedEmail);
        return user;
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = load(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessRuleException("WRONG_PASSWORD", "Your current password wasn't right.");
        }
        user.changePasswordHash(passwordEncoder.encode(newPassword));
    }

    private User load(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }
}
