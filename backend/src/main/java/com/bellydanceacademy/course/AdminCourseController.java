package com.bellydanceacademy.course;

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
@RequestMapping("/api/admin/courses")
class AdminCourseController {

    private final AdminCourseService adminCourses;

    AdminCourseController(AdminCourseService adminCourses) {
        this.adminCourses = adminCourses;
    }

    @GetMapping("/pending")
    List<PendingCourseResponse> listPending() {
        return adminCourses.listPending().stream().map(PendingCourseResponse::from).toList();
    }

    @PostMapping("/{courseId}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void approve(@PathVariable Long courseId) {
        adminCourses.approve(courseId);
    }

    @PostMapping("/{courseId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void reject(@PathVariable Long courseId) {
        adminCourses.reject(courseId);
    }

    record PendingCourseResponse(Long id, String slug, String title, String instructorName, int priceCents,
                                 Instant submittedAt) {

        static PendingCourseResponse from(CourseWithInstructor row) {
            Course course = row.course();
            return new PendingCourseResponse(course.getId(), course.getSlug(), course.getTitle(), row.instructorName(),
                    course.getPriceCents(), course.getCreatedAt());
        }
    }
}
