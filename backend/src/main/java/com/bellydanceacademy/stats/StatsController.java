package com.bellydanceacademy.stats;

import com.bellydanceacademy.catalog.InstructorDirectoryService;
import com.bellydanceacademy.commerce.PurchaseQueryService;
import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.instructor.InstructorApplicationService;
import com.bellydanceacademy.learning.EnrollmentService;
import com.bellydanceacademy.user.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Headline numbers: public ones for the home page, private ones for the admin overview. */
@RestController
class StatsController {

    private final CourseQueryService courseQueries;
    private final InstructorDirectoryService instructorDirectory;
    private final InstructorApplicationService instructorApplications;
    private final EnrollmentService enrollments;
    private final PurchaseQueryService purchaseQueries;
    private final UserRepository users;

    StatsController(CourseQueryService courseQueries, InstructorDirectoryService instructorDirectory,
                    InstructorApplicationService instructorApplications, EnrollmentService enrollments,
                    PurchaseQueryService purchaseQueries, UserRepository users) {
        this.courseQueries = courseQueries;
        this.instructorDirectory = instructorDirectory;
        this.instructorApplications = instructorApplications;
        this.enrollments = enrollments;
        this.purchaseQueries = purchaseQueries;
        this.users = users;
    }

    @GetMapping("/api/stats")
    PublicStats publicStats() {
        return new PublicStats(courseQueries.countLive(), instructorDirectory.count(), enrollments.countStudents());
    }

    @GetMapping("/api/admin/overview")
    AdminOverview adminOverview() {
        return new AdminOverview(
                instructorApplications.countPending(),
                courseQueries.countPending(),
                users.count(),
                courseQueries.countLive(),
                purchaseQueries.platformRevenueCents(),
                enrollments.countEnrollments());
    }

    record PublicStats(long courseCount, long instructorCount, long studentCount) {
    }

    record AdminOverview(long pendingApplications, long pendingCourses, long totalUsers, long liveCourses,
                         long platformRevenueCents, long enrollmentCount) {
    }
}
