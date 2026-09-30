package com.bellydanceacademy.review;

import com.bellydanceacademy.commerce.Purchase;
import com.bellydanceacademy.commerce.PurchaseQueryService;
import com.bellydanceacademy.common.error.ForbiddenException;
import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseQueryService;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviews;
    private final CourseQueryService courseQueries;
    private final PurchaseQueryService purchaseQueries;

    ReviewService(ReviewRepository reviews, CourseQueryService courseQueries, PurchaseQueryService purchaseQueries) {
        this.reviews = reviews;
        this.courseQueries = courseQueries;
        this.purchaseQueries = purchaseQueries;
    }

    /**
     * Creates or updates the student's review. Only a verified purchaser may
     * post — proven by an actual purchase row, never a client-side flag.
     */
    @Transactional
    public Review submit(Long studentId, String courseSlug, int rating, String comment) {
        Course course = courseQueries.getLiveBySlug(courseSlug);
        Purchase purchase = purchaseQueries.findPaidPurchase(studentId, course.getId())
                .orElseThrow(() -> new ForbiddenException("NOT_A_PURCHASER",
                        "Only students who've purchased this course can leave a review."));

        Review review = reviews.findByStudentIdAndCourseId(studentId, course.getId())
                .map(existing -> {
                    existing.revise(rating, comment);
                    return existing;
                })
                .orElseGet(() -> new Review(studentId, course.getId(), purchase.getId(), rating, comment));
        return reviews.save(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewView> listVisible(Long courseId) {
        return reviews.findVisibleForCourse(courseId);
    }

    @Transactional(readOnly = true)
    public Optional<Review> findByStudent(Long studentId, Long courseId) {
        return reviews.findByStudentIdAndCourseId(studentId, courseId);
    }

    /** Ratings for many courses in one query; courses without reviews get an empty summary. */
    @Transactional(readOnly = true)
    public Map<Long, RatingSummary> summarize(Collection<Long> courseIds) {
        if (courseIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, RatingSummary> found = reviews.summarize(courseIds).stream()
                .collect(Collectors.toMap(RatingSummary::courseId, Function.identity()));
        return courseIds.stream().distinct().collect(Collectors.toMap(Function.identity(),
                id -> found.getOrDefault(id, RatingSummary.none(id))));
    }

    @Transactional(readOnly = true)
    public Optional<ReviewView> featured() {
        return reviews.findFeatured(Limit.of(1)).stream().findFirst();
    }

    @Transactional(readOnly = true)
    public List<ReviewView> listForModeration() {
        return reviews.findAllForModeration();
    }

    @Transactional
    public void changeStatus(Long reviewId, ReviewStatus status) {
        reviews.findById(reviewId).orElseThrow(() -> new NotFoundException("Review")).changeStatus(status);
    }
}
