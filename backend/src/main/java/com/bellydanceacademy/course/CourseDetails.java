package com.bellydanceacademy.course;

/** The instructor-editable part of a course, validated at the API edge. */
public record CourseDetails(
        String title,
        String description,
        String about,
        CourseLevel level,
        String style,
        int priceCents,
        Integer originalPriceCents,
        String durationLabel) {
}
