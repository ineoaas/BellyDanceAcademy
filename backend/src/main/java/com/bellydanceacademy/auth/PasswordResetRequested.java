package com.bellydanceacademy.auth;

/** Carries the raw token in memory only, so the notifier can email the link. */
public record PasswordResetRequested(String email, String rawToken) {

    @Override
    public String toString() {
        return "PasswordResetRequested[email=" + email + "]";
    }
}
