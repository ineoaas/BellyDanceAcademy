package com.bellydanceacademy.catalog;

import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.course.CourseSearchCriteria;
import com.bellydanceacademy.instructor.InstructorProfile;
import com.bellydanceacademy.instructor.InstructorProfileService;
import com.bellydanceacademy.learning.EnrollmentService;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.lesson.LessonQueryService;
import com.bellydanceacademy.review.RatingSummary;
import com.bellydanceacademy.review.ReviewService;
import com.bellydanceacademy.user.AuthenticatedUser;
import com.bellydanceacademy.user.Role;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import com.bellydanceacademy.wishlist.WishlistService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The public catalog read-model. Composes courses with their instructors,
 * lesson counts and ratings using a fixed number of batched queries per
 * page, however many courses are listed.
 */
@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CourseQueryService courseQueries;
    private final LessonQueryService lessonQueries;
    private final ReviewService reviewService;
    private final UserRepository users;
    private final InstructorProfileService instructorProfiles;
    private final EnrollmentService enrollments;
    private final WishlistService wishlist;

    CatalogService(CourseQueryService courseQueries, LessonQueryService lessonQueries, ReviewService reviewService,
                   UserRepository users, InstructorProfileService instructorProfiles, EnrollmentService enrollments,
                   WishlistService wishlist) {
        this.courseQueries = courseQueries;
        this.lessonQueries = lessonQueries;
        this.reviewService = reviewService;
        this.users = users;
        this.instructorProfiles = instructorProfiles;
        this.enrollments = enrollments;
        this.wishlist = wishlist;
    }

    public List<CourseCard> search(CourseSearchCriteria criteria) {
        return toCards(courseQueries.searchLive(criteria));
    }

    public List<String> styles() {
        return courseQueries.liveStyles();
    }

    public CourseDetail detail(String slug, AuthenticatedUser viewer) {
        Course course = courseQueries.getLiveBySlug(slug);
        List<Lesson> lessons = lessonQueries.listForCourse(course.getId());
        String instructorSlug = instructorProfiles.findForUser(course.getInstructorId())
                .map(InstructorProfile::getSlug)
                .orElse(null);

        List<CourseDetail.CurriculumItem> curriculum = lessons.stream()
                .map(lesson -> new CourseDetail.CurriculumItem(
                        lesson.getId(),
                        lesson.getPosition(),
                        lesson.getTitle(),
                        lesson.getDurationSeconds(),
                        lesson.isPreview(),
                        lesson.isPreview() && lesson.hasPlayableVideo() ? lesson.getMuxPlaybackId() : null))
                .toList();

        return new CourseDetail(toCards(List.of(course)).getFirst(), course.getAbout(), instructorSlug, curriculum,
                viewerState(viewer, course));
    }

    List<CourseCard> toCards(List<Course> courses) {
        if (courses.isEmpty()) {
            return List.of();
        }
        Set<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toSet());
        Set<Long> instructorIds = courses.stream().map(Course::getInstructorId).collect(Collectors.toSet());

        Map<Long, String> instructorNames = users.findAllById(instructorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));
        Map<Long, Long> lessonCounts = lessonQueries.countByCourse(courseIds);
        Map<Long, RatingSummary> ratings = reviewService.summarize(courseIds);

        return courses.stream().map(course -> {
            RatingSummary rating = ratings.getOrDefault(course.getId(), RatingSummary.none(course.getId()));
            return new CourseCard(
                    course.getId(),
                    course.getSlug(),
                    course.getTitle(),
                    instructorNames.get(course.getInstructorId()),
                    course.getLevel(),
                    course.getStyle(),
                    course.getPriceCents(),
                    course.getOriginalPriceCents(),
                    course.getDescription(),
                    course.getDurationLabel(),
                    lessonCounts.getOrDefault(course.getId(), 0L),
                    rating.count() > 0 ? roundToTenth(rating.average()) : null,
                    rating.count());
        }).toList();
    }

    private CourseDetail.ViewerState viewerState(AuthenticatedUser viewer, Course course) {
        if (viewer == null || !viewer.hasRole(Role.STUDENT)) {
            return null;
        }
        CourseDetail.MyReview review = reviewService.findByStudent(viewer.id(), course.getId())
                .map(existing -> new CourseDetail.MyReview(existing.getRating(), existing.getComment()))
                .orElse(null);
        return new CourseDetail.ViewerState(
                enrollments.isEnrolled(viewer.id(), course.getId()),
                wishlist.contains(viewer.id(), course.getId()),
                review);
    }

    private static double roundToTenth(double value) {
        return Math.round(value * 10) / 10.0;
    }
}
