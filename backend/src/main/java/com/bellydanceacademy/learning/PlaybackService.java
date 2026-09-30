package com.bellydanceacademy.learning;

import com.bellydanceacademy.common.error.ForbiddenException;
import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.common.error.UnauthorizedException;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseRepository;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.lesson.LessonQueryService;
import com.bellydanceacademy.user.AuthenticatedUser;
import com.bellydanceacademy.user.Role;
import com.bellydanceacademy.video.MuxPlaybackTokenSigner;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Decides who may watch a lesson, and hands back what the player needs.
 * Preview lessons are open to everyone; the rest need an enrollment
 * (or course ownership). Paid videos only ever play with a signed token.
 */
@Service
public class PlaybackService {

    private final CourseRepository courses;
    private final LessonQueryService lessonQueries;
    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository progress;
    private final MuxPlaybackTokenSigner tokenSigner;

    PlaybackService(CourseRepository courses, LessonQueryService lessonQueries, EnrollmentRepository enrollments,
                    LessonProgressRepository progress, MuxPlaybackTokenSigner tokenSigner) {
        this.courses = courses;
        this.lessonQueries = lessonQueries;
        this.enrollments = enrollments;
        this.progress = progress;
        this.tokenSigner = tokenSigner;
    }

    @Transactional(readOnly = true)
    public WatchView watch(AuthenticatedUser viewer, String courseSlug, Long lessonId) {
        Course course = courses.findBySlug(courseSlug).orElseThrow(() -> new NotFoundException("Course"));
        boolean isOwner = viewer != null && course.isOwnedBy(viewer.id());
        if (!course.isLive() && !isOwner) {
            throw new NotFoundException("Course");
        }

        Lesson lesson = lessonQueries.getInCourse(course.getId(), lessonId);
        boolean enrolled = viewer != null && viewer.hasRole(Role.STUDENT)
                && enrollments.existsByStudentIdAndCourseId(viewer.id(), course.getId());
        boolean fullAccess = isOwner || enrolled;

        if (!lesson.isPreview() && !fullAccess) {
            if (viewer == null) {
                throw new UnauthorizedException("UNAUTHENTICATED", "Please log in to watch this lesson.");
            }
            throw new ForbiddenException("LESSON_LOCKED",
                    "That lesson is only available to students enrolled in this course.");
        }

        List<Lesson> lessons = lessonQueries.listForCourse(course.getId());
        Map<Long, LessonProgress> progressByLesson = enrolled
                ? progress.findByStudentIdAndLessonIdIn(viewer.id(), lessons.stream().map(Lesson::getId).toList())
                        .stream().collect(Collectors.toMap(LessonProgress::getLessonId, Function.identity()))
                : Map.of();

        LessonProgress current = progressByLesson.get(lesson.getId());
        int startPosition = current == null ? 0
                : ProgressRules.resumePosition(current.getSecondsWatched(), current.isCompleted());

        return new WatchView(
                new WatchView.CourseRef(course.getSlug(), course.getTitle()),
                new WatchView.PlayableLesson(
                        lesson.getId(),
                        lesson.getPosition(),
                        lesson.getTitle(),
                        lesson.getDurationSeconds(),
                        lesson.hasPlayableVideo() ? lesson.getMuxPlaybackId() : null,
                        playbackToken(lesson),
                        startPosition,
                        enrolled),
                lessons.stream().map(item -> new WatchView.LessonItem(
                        item.getId(),
                        item.getPosition(),
                        item.getTitle(),
                        item.isPreview() || fullAccess,
                        progressByLesson.containsKey(item.getId()) && progressByLesson.get(item.getId()).isCompleted()))
                        .toList());
    }

    private String playbackToken(Lesson lesson) {
        if (!lesson.hasPlayableVideo() || lesson.isPreview()) {
            return null;
        }
        return tokenSigner.sign(lesson.getMuxPlaybackId());
    }
}
