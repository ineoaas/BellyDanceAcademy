package com.bellydanceacademy.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** One review per student per course, tied to the purchase that entitles them to write it. */
@Entity
@Table(name = "reviews")
public class Review {

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
    private short rating;

    @Column(nullable = false)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    protected Review() {
    }

    /** New reviews publish immediately — the purchase requirement is the spam gate. */
    Review(Long studentId, Long courseId, Long purchaseId, int rating, String comment) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.purchaseId = purchaseId;
        this.status = ReviewStatus.VISIBLE;
        revise(rating, comment);
    }

    /** Editing never changes moderation status: a hidden review stays hidden. */
    void revise(int rating, String comment) {
        this.rating = (short) rating;
        this.comment = comment == null ? "" : comment.trim();
    }

    void changeStatus(ReviewStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
