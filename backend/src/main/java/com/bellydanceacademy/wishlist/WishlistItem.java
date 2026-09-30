package com.bellydanceacademy.wishlist;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "wishlist_items")
class WishlistItem {

    @EmbeddedId
    private Key id;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected WishlistItem() {
    }

    WishlistItem(Long studentId, Long courseId) {
        this.id = new Key(studentId, courseId);
    }

    @Embeddable
    record Key(@Column(name = "student_id") Long studentId, @Column(name = "course_id") Long courseId)
            implements Serializable {
    }
}
