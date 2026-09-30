package com.bellydanceacademy.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "password_reset_tokens")
class PasswordResetToken {

    @Id
    private String tokenHash;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    protected PasswordResetToken() {
    }

    PasswordResetToken(String tokenHash, Long userId, Instant createdAt, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    Long getUserId() {
        return userId;
    }

    boolean isExpired(Instant now) {
        return !expiresAt.isAfter(now);
    }
}
