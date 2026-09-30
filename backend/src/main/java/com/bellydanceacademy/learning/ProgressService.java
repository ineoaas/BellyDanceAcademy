package com.bellydanceacademy.learning;

import com.bellydanceacademy.common.error.ForbiddenException;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.lesson.LessonQueryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository progress;
    private final LessonQueryService lessonQueries;

    ProgressService(EnrollmentRepository enrollments, LessonProgressRepository progress,
                    LessonQueryService lessonQueries) {
        this.enrollments = enrollments;
        this.progress = progress;
        this.lessonQueries = lessonQueries;
    }

    /**
     * Records a playback position reported by the player: updates the
     * lesson's furthest point, the course resume point, and the course
     * percentage together, since they always change as a unit.
     *
     * @return the course's new completion percentage
     */
    @Transactional
    public int recordPosition(Long studentId, Long lessonId, double reportedPositionSeconds) {
        Lesson lesson = lessonQueries.getById(lessonId);
        Enrollment enrollment = enrollments.findByStudentIdAndCourseId(studentId, lesson.getCourseId())
                .orElseThrow(() -> new ForbiddenException("NOT_ENROLLED", "You're not enrolled in this course."));

        int position = ProgressRules.clampPosition(reportedPositionSeconds, lesson.getDurationSeconds());
        progress.upsert(studentId, lessonId, position,
                ProgressRules.isComplete(position, lesson.getDurationSeconds()));
        enrollment.recordResumePoint(lessonId, position);

        int percent = ProgressRules.percent(
                progress.countCompletedInCourse(studentId, lesson.getCourseId()),
                lessonQueries.countForCourse(lesson.getCourseId()));
        enrollment.updateProgressPercent(percent);
        return percent;
    }
}
