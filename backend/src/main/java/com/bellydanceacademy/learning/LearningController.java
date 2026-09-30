package com.bellydanceacademy.learning;

import com.bellydanceacademy.lesson.LessonQueryService;
import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class LearningController {

    private final EnrollmentService enrollmentService;
    private final PlaybackService playbackService;
    private final ProgressService progressService;
    private final LessonQueryService lessonQueries;

    LearningController(EnrollmentService enrollmentService, PlaybackService playbackService,
                       ProgressService progressService, LessonQueryService lessonQueries) {
        this.enrollmentService = enrollmentService;
        this.playbackService = playbackService;
        this.progressService = progressService;
        this.lessonQueries = lessonQueries;
    }

    /** The student dashboard: every owned course, with where to pick up. */
    @GetMapping("/api/me/enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    List<EnrollmentResponse> myEnrollments(@AuthenticationPrincipal AuthenticatedUser me) {
        List<EnrollmentView> views = enrollmentService.listForStudent(me.id());
        Map<Long, Long> firstLessons = lessonQueries.firstLessonIdByCourse(
                views.stream().map(view -> view.enrollment().getCourseId()).toList());

        return views.stream().map(view -> {
            Enrollment enrollment = view.enrollment();
            Long lastLessonId = enrollment.getLastLessonId();
            return new EnrollmentResponse(
                    enrollment.getCourseId(),
                    view.courseSlug(),
                    view.courseTitle(),
                    view.instructorName(),
                    enrollment.getProgressPercent(),
                    lastLessonId != null ? lastLessonId : firstLessons.get(enrollment.getCourseId()),
                    lastLessonId != null);
        }).toList();
    }

    /** Public: preview lessons are watchable without an account. */
    @GetMapping("/api/courses/{slug}/lessons/{lessonId}/watch")
    WatchView watch(@AuthenticationPrincipal AuthenticatedUser viewer, @PathVariable String slug,
                    @PathVariable Long lessonId) {
        return playbackService.watch(viewer, slug, lessonId);
    }

    @PutMapping("/api/me/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    ProgressResponse recordProgress(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long lessonId,
                                    @Valid @RequestBody ProgressRequest request) {
        return new ProgressResponse(progressService.recordPosition(me.id(), lessonId, request.positionSeconds()));
    }

    /**
     * @param resumeLessonId the lesson to open — the last one watched, or
     *                       the first if the course hasn't been started; null if it has no lessons
     */
    record EnrollmentResponse(Long courseId, String courseSlug, String courseTitle, String instructorName,
                              int progressPercent, Long resumeLessonId, boolean started) {
    }

    record ProgressRequest(@NotNull @PositiveOrZero Double positionSeconds) {
    }

    record ProgressResponse(int courseProgressPercent) {
    }
}
