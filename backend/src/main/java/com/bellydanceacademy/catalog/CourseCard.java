package com.bellydanceacademy.catalog;

import com.bellydanceacademy.course.CourseLevel;

/**
 * The summary shown wherever a course is listed.
 *
 * @param averageRating null until the course has a visible review
 */
public record CourseCard(
        Long id,
        String slug,
        String title,
        String instructorName,
        CourseLevel level,
        String style,
        int priceCents,
        Integer originalPriceCents,
        String description,
        String durationLabel,
        long lessonCount,
        Double averageRating,
        long reviewCount) {
}
