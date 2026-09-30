package com.bellydanceacademy.commerce;

import java.time.Instant;

record PayoutResponse(Long id, int amountCents, String currency, PayoutStatus status, Instant requestedAt,
                      String instructorName) {

    static PayoutResponse from(Payout payout) {
        return from(payout, null);
    }

    static PayoutResponse from(Payout payout, String instructorName) {
        return new PayoutResponse(payout.getId(), payout.getAmountCents(), payout.getCurrency(), payout.getStatus(),
                payout.getRequestedAt(), instructorName);
    }
}
