package com.bellydanceacademy.video;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class MuxWebhookVerifierTest {

    private static final String SECRET = "whsec_test";
    private static final Instant NOW = Instant.parse("2026-09-30T12:00:00Z");
    private static final String BODY = "{\"type\":\"video.asset.ready\"}";

    private final MuxWebhookVerifier verifier = new MuxWebhookVerifier(
            new MuxProperties(null, null, null, null, SECRET, Duration.ofHours(4)),
            Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void acceptsAFreshCorrectlySignedPayload() {
        long t = NOW.getEpochSecond();
        assertThat(verifier.isValid(BODY, "t=" + t + ",v1=" + sign(t + "." + BODY))).isTrue();
    }

    @Test
    void rejectsTamperedBody() {
        long t = NOW.getEpochSecond();
        assertThat(verifier.isValid(BODY + " ", "t=" + t + ",v1=" + sign(t + "." + BODY))).isFalse();
    }

    @Test
    void rejectsReplayOutsideTolerance() {
        long t = NOW.minus(Duration.ofMinutes(6)).getEpochSecond();
        assertThat(verifier.isValid(BODY, "t=" + t + ",v1=" + sign(t + "." + BODY))).isFalse();
    }

    @Test
    void rejectsMissingOrMalformedHeaders() {
        assertThat(verifier.isValid(BODY, null)).isFalse();
        assertThat(verifier.isValid(BODY, "garbage")).isFalse();
        assertThat(verifier.isValid(BODY, "t=abc,v1=zz")).isFalse();
    }

    private static String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
