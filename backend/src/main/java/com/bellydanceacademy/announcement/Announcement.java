package com.bellydanceacademy.announcement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

/** A site-wide banner message. Deactivated rather than deleted. */
@Entity
@Table(name = "announcements")
class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean active;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Announcement() {
    }

    Announcement(String message) {
        this.message = message.trim();
        this.active = true;
    }

    void setActive(boolean active) {
        this.active = active;
    }

    Long getId() {
        return id;
    }

    String getMessage() {
        return message;
    }

    boolean isActive() {
        return active;
    }

    Instant getCreatedAt() {
        return createdAt;
    }
}
