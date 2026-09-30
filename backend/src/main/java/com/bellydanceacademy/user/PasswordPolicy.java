package com.bellydanceacademy.user;

/** Shared so registration, reset and change-password can't drift apart. */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;
    public static final int MAX_LENGTH = 128;
    public static final String MESSAGE = "Password must be at least " + MIN_LENGTH + " characters.";

    private PasswordPolicy() {
    }
}
