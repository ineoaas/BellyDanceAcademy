package com.bellydanceacademy.common.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class FixedWindowRateLimiterTest {

    private static final RateLimit THREE_PER_MINUTE = new RateLimit("test", 3, Duration.ofMinutes(1));

    private final MutableClock clock = new MutableClock();
    private final FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(clock);

    @Test
    void allowsUpToTheLimitThenRejectsUntilTheWindowEnds() {
        for (int i = 0; i < 3; i++) {
            assertThat(limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1").allowed()).isTrue();
        }

        clock.advance(Duration.ofSeconds(20));
        FixedWindowRateLimiter.Decision rejected = limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1");
        assertThat(rejected.allowed()).isFalse();
        assertThat(rejected.retryAfter()).isEqualTo(Duration.ofSeconds(40));

        clock.advance(Duration.ofSeconds(40));
        assertThat(limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1").allowed()).isTrue();
    }

    @Test
    void countsEachClientSeparately() {
        for (int i = 0; i < 3; i++) {
            limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1");
        }

        assertThat(limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1").allowed()).isFalse();
        assertThat(limiter.tryAcquire(THREE_PER_MINUTE, "2.2.2.2").allowed()).isTrue();
    }

    @Test
    void countsEachLimitSeparately() {
        RateLimit other = new RateLimit("other", 1, Duration.ofMinutes(1));
        for (int i = 0; i < 3; i++) {
            limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1");
        }

        assertThat(limiter.tryAcquire(other, "1.1.1.1").allowed()).isTrue();
    }

    @Test
    void evictsOnlyFinishedWindows() {
        limiter.tryAcquire(THREE_PER_MINUTE, "1.1.1.1");
        clock.advance(Duration.ofSeconds(30));
        limiter.tryAcquire(THREE_PER_MINUTE, "2.2.2.2");

        clock.advance(Duration.ofSeconds(30));
        limiter.evictExpired();

        assertThat(limiter.trackedWindows()).isEqualTo(1);
    }

    private static final class MutableClock extends Clock {

        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }
}
