package com.bellydanceacademy.catalog;

import java.util.List;

/**
 * A course page. {@code viewer} is null for anyone who isn't a signed-in
 * student — it's what they personally own, saved or wrote.
 */
public record CourseDetail(
        CourseCard course,
        String about,
        String instructorSlug,
        List<CurriculumItem> curriculum,
        ViewerState viewer) {

    /** @param previewPlaybackId set only for preview lessons with a ready video */
    public record CurriculumItem(Long id, int position, String title, Integer durationSeconds, boolean preview,
                                 String previewPlaybackId) {
    }

    public record ViewerState(boolean enrolled, boolean wishlisted, MyReview review) {
    }

    public record MyReview(int rating, String comment) {
    }
}
