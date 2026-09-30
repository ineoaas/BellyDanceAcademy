package com.bellydanceacademy.commerce;

/**
 * How a sale is split between platform and instructor. The platform's cut
 * is rounded to the nearest cent; the instructor gets exactly the rest, so
 * the two parts always add back up to the price.
 */
public record Commission(int platformCents, int instructorCents) {

    public static Commission split(int priceCents, int ratePercent) {
        if (priceCents < 0) {
            throw new IllegalArgumentException("Price can't be negative");
        }
        if (ratePercent < 0 || ratePercent > 100) {
            throw new IllegalArgumentException("Commission rate must be between 0 and 100");
        }
        // Exact integer round-half-up; no floating point anywhere near money.
        int platformCents = (int) ((priceCents * (long) ratePercent + 50) / 100);
        return new Commission(platformCents, priceCents - platformCents);
    }
}
