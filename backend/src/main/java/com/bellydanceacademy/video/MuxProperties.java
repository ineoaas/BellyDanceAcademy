package com.bellydanceacademy.video;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Mux credentials. All optional so the app boots without them; the
 * features that need Mux fail with a clear error when they're missing.
 *
 * @param signingPrivateKey base64-encoded PEM, exactly as Mux issues it
 */
@ConfigurationProperties("app.mux")
public record MuxProperties(
        String tokenId,
        String tokenSecret,
        String signingKeyId,
        String signingPrivateKey,
        String webhookSecret,
        Duration playbackTokenTtl) {

    boolean apiConfigured() {
        return hasText(tokenId) && hasText(tokenSecret);
    }

    boolean signingConfigured() {
        return hasText(signingKeyId) && hasText(signingPrivateKey);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
