package com.bellydanceacademy.learning;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

/** A student's entitlement to a course, created alongside the purchase that paid for it. */
@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long studentId;

    @Column(nullable = false, updatable = false)
    private Long courseId;

    @Column(nullable = false, updatable = false)
    private Long purchaseId;

    @Column(nullable = false)
    private int progressPercent;

    private Long lastLessonId;

    @Column(nullable = false)
    private int lastPositionSeconds;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Enrollment() {
    }

    Enrollment(Long studentId, Long courseId, Long purchaseId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.purchaseId = purchaseId;
    }

    void recordResumePoint(Long lessonId, int positionSeconds) {
        this.lastLessonId = lessonId;
        this.lastPositionSeconds = positionSeconds;
    }

    void updateProgressPercent(int percent) {
        this.progressPercent = percent;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public Long getLastLessonId() {
        return lastLessonId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
