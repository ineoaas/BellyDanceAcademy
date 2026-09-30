package com.bellydanceacademy.instructor;

import com.bellydanceacademy.user.User;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/instructor-applications")
class AdminInstructorApplicationController {

    private final InstructorApplicationService applications;

    AdminInstructorApplicationController(InstructorApplicationService applications) {
        this.applications = applications;
    }

    @GetMapping
    List<ApplicationResponse> listPending() {
        return applications.listPending().stream().map(ApplicationResponse::from).toList();
    }

    @PostMapping("/{userId}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void approve(@PathVariable Long userId) {
        applications.approve(userId);
    }

    @PostMapping("/{userId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void reject(@PathVariable Long userId) {
        applications.reject(userId);
    }

    record ApplicationResponse(Long id, String name, String email, Instant appliedAt) {

        static ApplicationResponse from(User user) {
            return new ApplicationResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
        }
    }
}
