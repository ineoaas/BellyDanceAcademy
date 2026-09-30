package com.bellydanceacademy.instructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** An instructor's public page. Its slug is fixed at creation so shared links never break. */
@Entity
@Table(name = "instructor_profiles")
public class InstructorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private Long userId;

    @Column(nullable = false, unique = true, updatable = false)
    private String slug;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String bio;

    @Column(nullable = false)
    private String credentials;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    protected InstructorProfile() {
    }

    InstructorProfile(Long userId, String slug) {
        this.userId = userId;
        this.slug = slug;
    }

    void update(String city, String bio, String credentials) {
        this.city = city.trim();
        this.bio = bio.trim();
        this.credentials = credentials.trim();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getSlug() {
        return slug;
    }

    public String getCity() {
        return city;
    }

    public String getBio() {
        return bio;
    }

    public String getCredentials() {
        return credentials;
    }
}
