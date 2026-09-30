package com.bellydanceacademy.course;

import com.bellydanceacademy.common.error.BusinessRuleException;
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

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String slug;

    @Column(nullable = false, updatable = false)
    private Long instructorId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseLevel level;

    @Column(nullable = false)
    private String style;

    @Column(nullable = false)
    private int priceCents;

    private Integer originalPriceCents;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String about;

    @Column(nullable = false)
    private String durationLabel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    protected Course() {
    }

    private Course(Long instructorId, String slug, CourseStatus status, CourseDetails details) {
        this.instructorId = instructorId;
        this.slug = slug;
        this.status = status;
        apply(details);
    }

    /** New courses wait for admin approval before going live. */
    public static Course submitForReview(Long instructorId, String slug, CourseDetails details) {
        return new Course(instructorId, slug, CourseStatus.PENDING, details);
    }

    /** For seeding and admin tooling only. */
    public static Course live(Long instructorId, String slug, CourseDetails details) {
        return new Course(instructorId, slug, CourseStatus.LIVE, details);
    }

    /** Edits never reset approval — re-reviewing every typo fix isn't worth the admin time. */
    public void update(CourseDetails details) {
        apply(details);
    }

    public void approve() {
        requirePending();
        status = CourseStatus.LIVE;
    }

    public void reject() {
        requirePending();
        status = CourseStatus.REJECTED;
    }

    public boolean isLive() {
        return status == CourseStatus.LIVE;
    }

    public boolean isOwnedBy(Long userId) {
        return instructorId.equals(userId);
    }

    private void apply(CourseDetails details) {
        this.title = details.title().trim();
        this.description = details.description().trim();
        this.about = details.about().trim();
        this.level = details.level();
        this.style = details.style().trim();
        this.priceCents = details.priceCents();
        this.originalPriceCents = details.originalPriceCents();
        this.durationLabel = details.durationLabel().trim();
    }

    private void requirePending() {
        if (status != CourseStatus.PENDING) {
            throw new BusinessRuleException("INVALID_STATUS_TRANSITION", "Only courses awaiting review can be approved or rejected.");
        }
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public String getTitle() {
        return title;
    }

    public CourseLevel getLevel() {
        return level;
    }

    public String getStyle() {
        return style;
    }

    public int getPriceCents() {
        return priceCents;
    }

    public Integer getOriginalPriceCents() {
        return originalPriceCents;
    }

    public String getDescription() {
        return description;
    }

    public String getAbout() {
        return about;
    }

    public String getDurationLabel() {
        return durationLabel;
    }

    public CourseStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
