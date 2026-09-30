package com.bellydanceacademy.review;

/** Average and count over a course's visible reviews. */
public record RatingSummary(Long courseId, double average, long count) {

    public static RatingSummary none(Long courseId) {
        return new RatingSummary(courseId, 0, 0);
    }
}
