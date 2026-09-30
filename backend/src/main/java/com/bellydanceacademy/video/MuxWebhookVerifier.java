package com.bellydanceacademy.video;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Verifies the {@code Mux-Signature} header ({@code t=<unix>,v1=<hex hmac>}):
 * an HMAC-SHA256 of {@code "<t>.<raw body>"} keyed with the webhook secret,
 * rejected if older than the tolerance to stop replays.
 */
@Component
public class MuxWebhookVerifier {

    static final Duration TOLERANCE = Duration.ofMinutes(5);

    private final MuxProperties properties;
    private final Clock clock;

    MuxWebhookVerifier(MuxProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public boolean isValid(String rawBody, String signatureHeader) {
        if (signatureHeader == null || properties.webhookSecret() == null || properties.webhookSecret().isBlank()) {
            return false;
        }
        String timestamp = null;
        String signature = null;
        for (String part : signatureHeader.split(",")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length != 2) {
                continue;
            }
            switch (pair[0]) {
                case "t" -> timestamp = pair[1];
                case "v1" -> signature = pair[1];
                default -> { }
            }
        }
        if (timestamp == null || signature == null || isStale(timestamp)) {
            return false;
        }
        byte[] expected = hmac(timestamp + "." + rawBody);
        byte[] actual;
        try {
            actual = HexFormat.of().parseHex(signature);
        } catch (IllegalArgumentException e) {
            return false;
        }
        return MessageDigest.isEqual(expected, actual);
    }

    private boolean isStale(String timestamp) {
        try {
            Instant signedAt = Instant.ofEpochSecond(Long.parseLong(timestamp));
            return Duration.between(signedAt, clock.instant()).abs().compareTo(TOLERANCE) > 0;
        } catch (NumberFormatException e) {
            return true;
        }
    }

    private byte[] hmac(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.webhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("HmacSHA256 unavailable", e);
        }
    }
}
