package com.bellydanceacademy.course;

import java.time.Instant;

/** The full editable view of a course, for its owner. */
record InstructorCourseResponse(
        Long id,
        String slug,
        String title,
        String description,
        String about,
        CourseLevel level,
        String style,
        int priceCents,
        Integer originalPriceCents,
        String durationLabel,
        CourseStatus status,
        Instant createdAt) {

    static InstructorCourseResponse from(Course course) {
        return new InstructorCourseResponse(course.getId(), course.getSlug(), course.getTitle(),
                course.getDescription(), course.getAbout(), course.getLevel(), course.getStyle(),
                course.getPriceCents(), course.getOriginalPriceCents(), course.getDurationLabel(),
                course.getStatus(), course.getCreatedAt());
    }
}
