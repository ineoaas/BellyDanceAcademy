package com.bellydanceacademy.course;

/** A course plus its instructor's display name, fetched in one query. */
public record CourseWithInstructor(Course course, String instructorName) {
}
