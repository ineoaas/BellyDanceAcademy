package com.bellydanceacademy.learning;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ProgressRulesTest {

    @Test
    void completesAtNinetyPercent() {
        assertThat(ProgressRules.isComplete(89, 100)).isFalse();
        assertThat(ProgressRules.isComplete(90, 100)).isTrue();
    }

    @Test
    void neverCompletesWithoutAKnownDuration() {
        assertThat(ProgressRules.isComplete(500, null)).isFalse();
        assertThat(ProgressRules.isComplete(500, 0)).isFalse();
    }

    @Test
    void clampsReportedPositionIntoTheLesson() {
        assertThat(ProgressRules.clampPosition(-4, 100)).isZero();
        assertThat(ProgressRules.clampPosition(9_999, 100)).isEqualTo(100);
        assertThat(ProgressRules.clampPosition(42.6, null)).isEqualTo(43);
    }

    @Test
    void computesCoursePercent() {
        assertThat(ProgressRules.percent(1, 3)).isEqualTo(33);
        assertThat(ProgressRules.percent(3, 3)).isEqualTo(100);
        assertThat(ProgressRules.percent(0, 0)).isZero();
    }

    @Test
    void restartsFinishedLessonsFromTheTop() {
        assertThat(ProgressRules.resumePosition(300, false)).isEqualTo(300);
        assertThat(ProgressRules.resumePosition(300, true)).isZero();
    }
}
