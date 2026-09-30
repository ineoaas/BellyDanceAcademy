package com.bellydanceacademy.learning;

/** Pure rules for what counts as progress — kept free of I/O so they're trivially testable. */
final class ProgressRules {

    /** Watching 90% counts as finished; nobody sits through the credits. */
    static final double COMPLETION_THRESHOLD = 0.9;

    private ProgressRules() {
    }

    static boolean isComplete(int positionSeconds, Integer durationSeconds) {
        return durationSeconds != null && durationSeconds > 0
                && positionSeconds >= durationSeconds * COMPLETION_THRESHOLD;
    }

    /** Clamps a client-reported position into the lesson's real length. */
    static int clampPosition(double positionSeconds, Integer durationSeconds) {
        int rounded = (int) Math.max(0, Math.round(positionSeconds));
        return durationSeconds != null && durationSeconds > 0 ? Math.min(rounded, durationSeconds) : rounded;
    }

    static int percent(long completedLessons, long totalLessons) {
        if (totalLessons <= 0) {
            return 0;
        }
        return (int) Math.min(100, Math.round(completedLessons * 100.0 / totalLessons));
    }

    /** Resume where they stopped, unless they'd finished — then start over. */
    static int resumePosition(int secondsWatched, boolean completed) {
        return completed ? 0 : secondsWatched;
    }
}
