package com.bellydanceacademy.learning;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Entitlements: who may watch which course. */
@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollments;

    EnrollmentService(EnrollmentRepository enrollments) {
        this.enrollments = enrollments;
    }

    /**
     * Must join the caller's transaction so a purchase and its enrollment
     * commit (or roll back) together — never paid-without-access.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void enroll(Long studentId, Long courseId, Long purchaseId) {
        enrollments.save(new Enrollment(studentId, courseId, purchaseId));
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long studentId, Long courseId) {
        return enrollments.existsByStudentIdAndCourseId(studentId, courseId);
    }

    @Transactional(readOnly = true)
    public long countStudents() {
        return enrollments.countDistinctStudents();
    }

    @Transactional(readOnly = true)
    public long countEnrollments() {
        return enrollments.count();
    }

    @Transactional(readOnly = true)
    List<EnrollmentView> listForStudent(Long studentId) {
        return enrollments.findViewsForStudent(studentId);
    }
}
