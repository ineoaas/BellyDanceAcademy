package com.bellydanceacademy.instructor;

import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.user.Role;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import com.bellydanceacademy.user.UserStatus;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin review of pending instructor accounts. */
@Service
public class InstructorApplicationService {

    private final UserRepository users;

    InstructorApplicationService(UserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<User> listPending() {
        return users.findByRoleAndStatusOrderByCreatedAtDesc(Role.INSTRUCTOR, UserStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public long countPending() {
        return users.countByRoleAndStatus(Role.INSTRUCTOR, UserStatus.PENDING);
    }

    @Transactional
    public void approve(Long userId) {
        loadApplicant(userId).approveApplication();
    }

    @Transactional
    public void reject(Long userId) {
        loadApplicant(userId).rejectApplication();
    }

    private User loadApplicant(Long userId) {
        return users.findById(userId)
                .filter(user -> user.getRole() == Role.INSTRUCTOR)
                .orElseThrow(() -> new NotFoundException("Application"));
    }
}
