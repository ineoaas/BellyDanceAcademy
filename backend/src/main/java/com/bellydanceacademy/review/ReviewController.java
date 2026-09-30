package com.bellydanceacademy.review;

import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ReviewController {

    private final ReviewService reviewService;
    private final CourseQueryService courseQueries;

    ReviewController(ReviewService reviewService, CourseQueryService courseQueries) {
        this.reviewService = reviewService;
        this.courseQueries = courseQueries;
    }

    @GetMapping("/api/courses/{slug}/reviews")
    List<PublicReview> list(@PathVariable String slug) {
        return reviewService.listVisible(courseQueries.getLiveBySlug(slug).getId()).stream()
                .map(PublicReview::from)
                .toList();
    }

    @PutMapping("/api/courses/{slug}/reviews/mine")
    @PreAuthorize("hasRole('STUDENT')")
    MyReview submit(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable String slug,
                    @Valid @RequestBody ReviewRequest request) {
        Review review = reviewService.submit(me.id(), slug, request.rating(), request.comment());
        return new MyReview(review.getRating(), review.getComment());
    }

    /** 204 until someone has left a review with a comment. */
    @GetMapping("/api/reviews/featured")
    ResponseEntity<PublicReview> featured() {
        return reviewService.featured()
                .map(PublicReview::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    record ReviewRequest(
            @NotNull(message = "Choose a rating.") @Min(1) @Max(5) Integer rating,
            @Size(max = 2000) String comment) {
    }

    record MyReview(int rating, String comment) {
    }

    record PublicReview(Long id, int rating, String comment, String studentName, Instant createdAt) {

        static PublicReview from(ReviewView view) {
            return new PublicReview(view.review().getId(), view.review().getRating(), view.review().getComment(),
                    view.studentName(), view.review().getCreatedAt());
        }
    }
}
