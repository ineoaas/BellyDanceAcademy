package com.bellydanceacademy.lesson;

import com.bellydanceacademy.common.error.NotFoundException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read access to lessons for other modules. */
@Service
@Transactional(readOnly = true)
public class LessonQueryService {

    private final LessonRepository lessons;

    LessonQueryService(LessonRepository lessons) {
        this.lessons = lessons;
    }

    public List<Lesson> listForCourse(Long courseId) {
        return lessons.findByCourseIdOrderByPositionAsc(courseId);
    }

    public Lesson getInCourse(Long courseId, Long lessonId) {
        return lessons.findById(lessonId)
                .filter(lesson -> lesson.getCourseId().equals(courseId))
                .orElseThrow(() -> new NotFoundException("Lesson"));
    }

    public Lesson getById(Long lessonId) {
        return lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Lesson"));
    }

    public long countForCourse(Long courseId) {
        return lessons.countByCourseId(courseId);
    }

    /** Lesson counts for many courses in one query; courses with none are absent. */
    public Map<Long, Long> countByCourse(Collection<Long> courseIds) {
        if (courseIds.isEmpty()) {
            return Map.of();
        }
        return lessons.countByCourseIds(courseIds).stream()
                .collect(Collectors.toMap(LessonCount::courseId, LessonCount::count));
    }

    /** Course id → id of its first lesson; courses with no lessons are absent. */
    public Map<Long, Long> firstLessonIdByCourse(Collection<Long> courseIds) {
        if (courseIds.isEmpty()) {
            return Map.of();
        }
        return lessons.findFirstLessons(courseIds).stream()
                .collect(Collectors.toMap(Lesson::getCourseId, Lesson::getId));
    }
}
