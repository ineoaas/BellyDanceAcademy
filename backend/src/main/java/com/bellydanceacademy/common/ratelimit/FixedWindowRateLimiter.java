package com.bellydanceacademy.common.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * In-memory fixed-window counters, keyed by limit and client.
 *
 * <p>Counters live in this JVM, which is right for a single API instance.
 * Running several instances would need a shared store (e.g. Redis) for the
 * limits to hold across them.
 */
class FixedWindowRateLimiter {

    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    FixedWindowRateLimiter(Clock clock) {
        this.clock = clock;
    }

    /** Counts one request from {@code client} against {@code limit}. */
    Decision tryAcquire(RateLimit limit, String client) {
        Instant now = clock.instant();
        Window window = windows.compute(limit.name() + ':' + client, (key, current) ->
                current == null || current.hasEnded(now)
                        ? new Window(now.plus(limit.window()), 1)
                        : current.increment());
        return window.count() <= limit.maxRequests()
                ? Decision.ALLOWED
                : Decision.rejected(Duration.between(now, window.endsAt()));
    }

    /** Drops finished windows so memory stays proportional to recent clients. */
    @Scheduled(fixedDelayString = "PT10M")
    void evictExpired() {
        Instant now = clock.instant();
        windows.values().removeIf(window -> window.hasEnded(now));
    }

    int trackedWindows() {
        return windows.size();
    }

    private record Window(Instant endsAt, int count) {

        boolean hasEnded(Instant now) {
            return !now.isBefore(endsAt);
        }

        Window increment() {
            return new Window(endsAt, count + 1);
        }
    }

    /** @param retryAfter how long until the client's window resets; zero when allowed */
    record Decision(boolean allowed, Duration retryAfter) {

        static final Decision ALLOWED = new Decision(true, Duration.ZERO);

        static Decision rejected(Duration retryAfter) {
            return new Decision(false, retryAfter);
        }
    }
}
