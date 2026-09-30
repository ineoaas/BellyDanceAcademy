package com.bellydanceacademy.user;

import com.bellydanceacademy.common.error.BusinessRuleException;
import com.bellydanceacademy.common.error.ConflictException;
import com.bellydanceacademy.common.error.NotFoundException;
import java.util.List;
import java.util.function.Consumer;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin moderation of accounts. Suspending needs no session cleanup:
 * sessions only resolve for ACTIVE users, so a suspended user is signed
 * out on their very next request.
 */
@Service
public class AdminUserService {

    private final UserRepository users;

    AdminUserService(UserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<User> listAll() {
        return users.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public User suspend(Long adminId, Long userId) {
        return changeOther(adminId, userId, User::suspend);
    }

    @Transactional
    public User reactivate(Long adminId, Long userId) {
        return changeOther(adminId, userId, User::reactivate);
    }

    /**
     * Hard-deletes an account with no history. Anyone who owns courses,
     * purchases or reviews is protected by RESTRICT foreign keys — the
     * database is the source of truth for "has dependents", not a list of
     * checks here that could drift out of date.
     */
    @Transactional
    public void delete(Long adminId, Long userId) {
        User user = loadOther(adminId, userId);
        try {
            users.delete(user);
            users.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("USER_HAS_DEPENDENTS",
                    "That account owns courses, purchases, or reviews — suspend it instead of deleting.");
        }
    }

    private User changeOther(Long adminId, Long userId, Consumer<User> change) {
        User user = loadOther(adminId, userId);
        change.accept(user);
        return user;
    }

    private User loadOther(Long adminId, Long userId) {
        if (adminId.equals(userId)) {
            throw new BusinessRuleException("CANNOT_MODERATE_SELF", "You can't suspend or delete your own account.");
        }
        return users.findById(userId).orElseThrow(() -> new NotFoundException("User"));
    }
}
