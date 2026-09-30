package com.bellydanceacademy.review;

/** A review with the names needed to display it, fetched in one query. */
public record ReviewView(Review review, String studentName, String courseTitle, String courseSlug) {
}
