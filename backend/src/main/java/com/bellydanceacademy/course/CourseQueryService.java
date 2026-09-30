package com.bellydanceacademy.course;

import com.bellydanceacademy.common.error.NotFoundException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read access to courses for other modules (catalog, checkout, learning). */
@Service
@Transactional(readOnly = true)
public class CourseQueryService {

    private final CourseRepository courses;

    CourseQueryService(CourseRepository courses) {
        this.courses = courses;
    }

    public List<Course> searchLive(CourseSearchCriteria criteria) {
        CourseSort sort = criteria.sort() != null ? criteria.sort() : CourseSort.NEWEST;
        return courses.findAll(CourseSpecifications.liveMatching(criteria), sort.toSort());
    }

    public List<String> liveStyles() {
        return courses.findLiveStyles();
    }

    /** Instructor id → number of live courses; instructors with none are absent. */
    public Map<Long, Long> liveCourseCountByInstructor() {
        return courses.countLiveByInstructor().stream()
                .collect(Collectors.toMap(InstructorCourseCount::instructorId, InstructorCourseCount::count));
    }

    public long countLive() {
        return courses.countByStatus(CourseStatus.LIVE);
    }

    public long countPending() {
        return courses.countByStatus(CourseStatus.PENDING);
    }

    /** Any live course — the only kind the public can see or buy. */
    public Course getLiveBySlug(String slug) {
        return courses.findBySlug(slug).filter(Course::isLive).orElseThrow(() -> new NotFoundException("Course"));
    }

    public Course getById(Long courseId) {
        return courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
    }

    public List<Course> listByInstructor(Long instructorId) {
        return courses.findByInstructorIdOrderByCreatedAtDesc(instructorId);
    }

    /**
     * A course the given instructor owns. Someone else's course id yields
     * 404 rather than 403, so ids can't be probed for existence.
     */
    public Course getOwnedBy(Long instructorId, Long courseId) {
        return courses.findById(courseId)
                .filter(course -> course.isOwnedBy(instructorId))
                .orElseThrow(() -> new NotFoundException("Course"));
    }
}
