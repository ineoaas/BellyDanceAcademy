package com.bellydanceacademy.course;

public enum CourseStatus {
    DRAFT,
    /** Submitted and waiting for admin review. */
    PENDING,
    /** Publicly listed and purchasable. */
    LIVE,
    REJECTED
}
