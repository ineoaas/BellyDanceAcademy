package com.bellydanceacademy.user;

import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
class AdminUserController {

    private final AdminUserService adminUsers;

    AdminUserController(AdminUserService adminUsers) {
        this.adminUsers = adminUsers;
    }

    @GetMapping
    List<AdminUserResponse> list() {
        return adminUsers.listAll().stream().map(AdminUserResponse::from).toList();
    }

    @PostMapping("/{userId}/suspend")
    AdminUserResponse suspend(@AuthenticationPrincipal AuthenticatedUser admin, @PathVariable Long userId) {
        return AdminUserResponse.from(adminUsers.suspend(admin.id(), userId));
    }

    @PostMapping("/{userId}/reactivate")
    AdminUserResponse reactivate(@AuthenticationPrincipal AuthenticatedUser admin, @PathVariable Long userId) {
        return AdminUserResponse.from(adminUsers.reactivate(admin.id(), userId));
    }

    @DeleteMapping("/{userId}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser admin, @PathVariable Long userId) {
        adminUsers.delete(admin.id(), userId);
        return ResponseEntity.noContent().build();
    }

    record AdminUserResponse(Long id, String name, String email, Role role, UserStatus status, Instant createdAt) {

        static AdminUserResponse from(User user) {
            return new AdminUserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                    user.getStatus(), user.getCreatedAt());
        }
    }
}
