package com.bellydanceacademy.commerce.stripe;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Optional so the app boots without Stripe; payment features fail clearly instead. */
@ConfigurationProperties("app.stripe")
public record StripeProperties(String secretKey, String webhookSecret) {

    boolean configured() {
        return secretKey != null && !secretKey.isBlank();
    }
}
