package com.bellydanceacademy.course;

/** Catalog filters; every field is optional. Prices are in cents. */
public record CourseSearchCriteria(
        String query,
        String style,
        CourseLevel level,
        Long instructorId,
        Integer minPriceCents,
        Integer maxPriceCents,
        CourseSort sort) {

    public static CourseSearchCriteria all() {
        return new CourseSearchCriteria(null, null, null, null, null, null, CourseSort.NEWEST);
    }

    public static CourseSearchCriteria byInstructor(Long instructorId) {
        return new CourseSearchCriteria(null, null, null, instructorId, null, null, CourseSort.NEWEST);
    }
}
