package com.bellydanceacademy.course;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCourseService {

    private final CourseRepository courses;
    private final CourseQueryService courseQueries;

    AdminCourseService(CourseRepository courses, CourseQueryService courseQueries) {
        this.courses = courses;
        this.courseQueries = courseQueries;
    }

    @Transactional(readOnly = true)
    public List<CourseWithInstructor> listPending() {
        return courses.findByStatusWithInstructor(CourseStatus.PENDING);
    }

    @Transactional
    public void approve(Long courseId) {
        courseQueries.getById(courseId).approve();
    }

    @Transactional
    public void reject(Long courseId) {
        courseQueries.getById(courseId).reject();
    }
}
