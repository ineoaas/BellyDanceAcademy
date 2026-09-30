package com.bellydanceacademy.learning;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    void deleteByPurchaseId(Long purchaseId);

    @Query("select count(distinct e.studentId) from Enrollment e")
    long countDistinctStudents();

    @Query("""
            select new com.bellydanceacademy.learning.EnrollmentView(e, c.slug, c.title, u.name)
            from Enrollment e
              join Course c on c.id = e.courseId
              join User u on u.id = c.instructorId
            where e.studentId = :studentId
            order by e.createdAt desc
            """)
    List<EnrollmentView> findViewsForStudent(Long studentId);
}
