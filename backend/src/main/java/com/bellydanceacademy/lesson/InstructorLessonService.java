package com.bellydanceacademy.lesson;

import com.bellydanceacademy.config.AppProperties;
import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.video.MuxClient;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lesson management by the owning instructor. Every operation re-checks
 * ownership through the course — a lesson id alone proves nothing.
 */
@Service
public class InstructorLessonService {

    private final LessonRepository lessons;
    private final LessonQueryService lessonQueries;
    private final CourseQueryService courseQueries;
    private final MuxClient muxClient;
    private final AppProperties appProperties;

    InstructorLessonService(LessonRepository lessons, LessonQueryService lessonQueries,
                            CourseQueryService courseQueries, MuxClient muxClient, AppProperties appProperties) {
        this.lessons = lessons;
        this.lessonQueries = lessonQueries;
        this.courseQueries = courseQueries;
        this.muxClient = muxClient;
        this.appProperties = appProperties;
    }

    @Transactional(readOnly = true)
    public List<Lesson> list(Long instructorId, Long courseId) {
        courseQueries.getOwnedBy(instructorId, courseId);
        return lessonQueries.listForCourse(courseId);
    }

    @Transactional
    public Lesson add(Long instructorId, Long courseId, String title, boolean preview) {
        courseQueries.getOwnedBy(instructorId, courseId);
        int nextPosition = lessons.findMaxPosition(courseId) + 1;
        return lessons.save(new Lesson(courseId, nextPosition, title, preview));
    }

    /** Swaps with the neighbour; moving past either end is a no-op. */
    @Transactional
    public List<Lesson> move(Long instructorId, Long lessonId, MoveDirection direction) {
        Lesson lesson = loadOwned(instructorId, lessonId);
        lessons.findByCourseIdAndPosition(lesson.getCourseId(), lesson.getPosition() + direction.offset())
                .ifPresent(lesson::swapPositionWith);
        lessons.flush();
        return lessonQueries.listForCourse(lesson.getCourseId());
    }

    /** Issues a Mux direct-upload URL; the browser sends the file straight to Mux. */
    @Transactional
    public String startVideoUpload(Long instructorId, Long lessonId) {
        Lesson lesson = loadOwned(instructorId, lessonId);
        MuxClient.DirectUpload upload = muxClient.createDirectUpload(appProperties.frontendUrl(), lesson.isPreview());
        lesson.startUpload(upload.id());
        return upload.url();
    }

    private Lesson loadOwned(Long instructorId, Long lessonId) {
        Lesson lesson = lessonQueries.getById(lessonId);
        courseQueries.getOwnedBy(instructorId, lesson.getCourseId());
        return lesson;
    }
}
