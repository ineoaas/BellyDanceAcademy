package com.bellydanceacademy.learning;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);

    List<LessonProgress> findByStudentIdAndLessonIdIn(Long studentId, Collection<Long> lessonIds);

    /**
     * Atomic upsert. Both columns only ever move forward, so rewinding a
     * lesson never un-completes it, and concurrent reports can't race.
     */
    @Modifying
    @Query(value = """
            insert into lesson_progress (student_id, lesson_id, seconds_watched, completed, updated_at)
            values (:studentId, :lessonId, :secondsWatched, :completed, now())
            on conflict (student_id, lesson_id) do update set
              seconds_watched = greatest(lesson_progress.seconds_watched, excluded.seconds_watched),
              completed       = lesson_progress.completed or excluded.completed,
              updated_at      = now()
            """, nativeQuery = true)
    void upsert(Long studentId, Long lessonId, int secondsWatched, boolean completed);

    @Query("""
            select count(p) from LessonProgress p join Lesson l on l.id = p.lessonId
            where p.studentId = :studentId and l.courseId = :courseId and p.completed = true
            """)
    long countCompletedInCourse(Long studentId, Long courseId);
}
