package com.bellydanceacademy.review;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
class AdminReviewController {

    private final ReviewService reviewService;

    AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    List<ModeratedReview> list() {
        return reviewService.listForModeration().stream().map(ModeratedReview::from).toList();
    }

    @PutMapping("/{reviewId}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void changeStatus(@PathVariable Long reviewId, @Valid @RequestBody StatusRequest request) {
        reviewService.changeStatus(reviewId, request.status());
    }

    record StatusRequest(@NotNull ReviewStatus status) {
    }

    record ModeratedReview(Long id, String courseTitle, String courseSlug, String studentName, int rating,
                           String comment, ReviewStatus status, Instant createdAt) {

        static ModeratedReview from(ReviewView view) {
            Review review = view.review();
            return new ModeratedReview(review.getId(), view.courseTitle(), view.courseSlug(), view.studentName(),
                    review.getRating(), review.getComment(), review.getStatus(), review.getCreatedAt());
        }
    }
}
