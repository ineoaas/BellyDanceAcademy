package com.bellydanceacademy.user;

public enum UserStatus {
    /** Can sign in. */
    ACTIVE,
    /** Instructor application awaiting admin review. */
    PENDING,
    SUSPENDED,
    /** Instructor application turned down. */
    REJECTED
}
