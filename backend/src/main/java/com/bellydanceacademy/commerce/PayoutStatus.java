package com.bellydanceacademy.commerce;

import java.util.Locale;

/** Mirrors every status Stripe reports for a payout. */
public enum PayoutStatus {
    PENDING,
    IN_TRANSIT,
    PAID,
    FAILED,
    CANCELED;

    static PayoutStatus fromStripe(String status) {
        return valueOf(status.toUpperCase(Locale.ROOT));
    }
}
