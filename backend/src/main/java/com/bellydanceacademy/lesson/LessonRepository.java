package com.bellydanceacademy.lesson;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByCourseIdOrderByPositionAsc(Long courseId);

    long countByCourseId(Long courseId);

    Optional<Lesson> findByCourseIdAndPosition(Long courseId, int position);

    Optional<Lesson> findByMuxUploadId(String muxUploadId);

    Optional<Lesson> findByMuxAssetId(String muxAssetId);

    @Query("select coalesce(max(l.position), 0) from Lesson l where l.courseId = :courseId")
    int findMaxPosition(Long courseId);

    @Query("""
            select new com.bellydanceacademy.lesson.LessonCount(l.courseId, count(l))
            from Lesson l where l.courseId in :courseIds group by l.courseId
            """)
    List<LessonCount> countByCourseIds(Collection<Long> courseIds);

    /** The first lesson of each course — where a student who hasn't started yet begins. */
    @Query("""
            select l from Lesson l
            where l.courseId in :courseIds
              and l.position = (select min(l2.position) from Lesson l2 where l2.courseId = l.courseId)
            """)
    List<Lesson> findFirstLessons(Collection<Long> courseIds);
}
