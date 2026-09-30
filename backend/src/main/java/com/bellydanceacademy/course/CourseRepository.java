package com.bellydanceacademy.course;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    Optional<Course> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Course> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);

    long countByStatus(CourseStatus status);

    @Query("""
            select distinct c.style from Course c
            where c.status = com.bellydanceacademy.course.CourseStatus.LIVE and c.style <> ''
            order by c.style
            """)
    List<String> findLiveStyles();

    @Query("""
            select new com.bellydanceacademy.course.InstructorCourseCount(c.instructorId, count(c))
            from Course c where c.status = com.bellydanceacademy.course.CourseStatus.LIVE
            group by c.instructorId
            """)
    List<InstructorCourseCount> countLiveByInstructor();

    @Query("""
            select new com.bellydanceacademy.course.CourseWithInstructor(c, u.name)
            from Course c join User u on u.id = c.instructorId
            where c.status = :status
            order by c.createdAt asc
            """)
    List<CourseWithInstructor> findByStatusWithInstructor(CourseStatus status);
}
