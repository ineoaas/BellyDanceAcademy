package com.bellydanceacademy.learning;

import java.util.List;

/** Everything the lesson player page needs, in one response. */
public record WatchView(CourseRef course, PlayableLesson lesson, List<LessonItem> lessons) {

    public record CourseRef(String slug, String title) {
    }

    /**
     * @param playbackId    null until the video finishes processing
     * @param playbackToken null for public (preview) videos
     * @param trackProgress true only for enrolled students
     */
    public record PlayableLesson(Long id, int position, String title, Integer durationSeconds, String playbackId,
                                 String playbackToken, int startPositionSeconds, boolean trackProgress) {
    }

    public record LessonItem(Long id, int position, String title, boolean watchable, boolean completed) {
    }
}
