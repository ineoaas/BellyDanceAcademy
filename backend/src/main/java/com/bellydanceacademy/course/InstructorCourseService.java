package com.bellydanceacademy.course;

import com.bellydanceacademy.common.text.Slugs;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Course authoring by the owning instructor. */
@Service
public class InstructorCourseService {

    private final CourseRepository courses;
    private final CourseQueryService courseQueries;

    InstructorCourseService(CourseRepository courses, CourseQueryService courseQueries) {
        this.courses = courses;
        this.courseQueries = courseQueries;
    }

    @Transactional
    public Course create(Long instructorId, CourseDetails details) {
        String slug = Slugs.unique(details.title(), "course", courses::existsBySlug);
        return courses.save(Course.submitForReview(instructorId, slug, details));
    }

    @Transactional
    public Course update(Long instructorId, Long courseId, CourseDetails details) {
        Course course = courseQueries.getOwnedBy(instructorId, courseId);
        course.update(details);
        return course;
    }
}
