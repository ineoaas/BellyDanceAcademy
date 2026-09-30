package com.bellydanceacademy.commerce;

import com.bellydanceacademy.course.CourseStatus;

public record CourseSales(Long courseId, String slug, String title, CourseStatus status, long studentCount,
                          long revenueCents) {
}
