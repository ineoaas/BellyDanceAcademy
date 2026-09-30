package com.bellydanceacademy.course;

import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructor/courses")
class InstructorCourseController {

    private final InstructorCourseService courseService;
    private final CourseQueryService courseQueries;

    InstructorCourseController(InstructorCourseService courseService, CourseQueryService courseQueries) {
        this.courseService = courseService;
        this.courseQueries = courseQueries;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    InstructorCourseResponse create(@AuthenticationPrincipal AuthenticatedUser me, @Valid @RequestBody CourseForm form) {
        return InstructorCourseResponse.from(courseService.create(me.id(), form.toDetails()));
    }

    @GetMapping("/{courseId}")
    InstructorCourseResponse get(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId) {
        return InstructorCourseResponse.from(courseQueries.getOwnedBy(me.id(), courseId));
    }

    @PutMapping("/{courseId}")
    InstructorCourseResponse update(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId,
                                    @Valid @RequestBody CourseForm form) {
        return InstructorCourseResponse.from(courseService.update(me.id(), courseId, form.toDetails()));
    }
}
