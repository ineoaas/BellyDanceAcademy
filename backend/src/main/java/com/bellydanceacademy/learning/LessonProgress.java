package com.bellydanceacademy.learning;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** Written only through {@link LessonProgressRepository#upsert}; read-only here. */
@Entity
@Table(name = "lesson_progress")
class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long lessonId;

    @Column(nullable = false)
    private int secondsWatched;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private Instant updatedAt;

    protected LessonProgress() {
    }

    Long getLessonId() {
        return lessonId;
    }

    int getSecondsWatched() {
        return secondsWatched;
    }

    boolean isCompleted() {
        return completed;
    }
}
