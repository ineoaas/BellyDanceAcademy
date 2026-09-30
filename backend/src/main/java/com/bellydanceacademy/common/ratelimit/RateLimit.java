package com.bellydanceacademy.common.ratelimit;

import java.time.Duration;

/**
 * At most {@code maxRequests} per {@code window} for each client.
 *
 * @param name identifies the limit's counters, so limits sharing a client don't share a budget
 */
record RateLimit(String name, int maxRequests, Duration window) {
}
