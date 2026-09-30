package com.bellydanceacademy.video;

import com.bellydanceacademy.common.error.ExternalServiceException;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.time.Clock;
import java.util.Base64;
import java.util.Date;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.springframework.stereotype.Component;

/**
 * Mints short-lived playback JWTs for signed Mux assets. Only this server
 * holds the signing key, and it only signs after checking the viewer is
 * entitled to the lesson — that's what keeps paid lessons paid.
 */
@Component
public class MuxPlaybackTokenSigner {

    private static final String VIDEO_AUDIENCE = "v";

    private final MuxProperties properties;
    private final Clock clock;
    private volatile RSASSASigner signer;

    MuxPlaybackTokenSigner(MuxProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public String sign(String playbackId) {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(playbackId)
                .audience(VIDEO_AUDIENCE)
                .expirationTime(Date.from(clock.instant().plus(properties.playbackTokenTtl())))
                .build();
        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(properties.signingKeyId()).build();
        try {
            SignedJWT jwt = new SignedJWT(header, claims);
            jwt.sign(signer());
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new ExternalServiceException("Video playback", e);
        }
    }

    private RSASSASigner signer() {
        if (signer == null) {
            synchronized (this) {
                if (signer == null) {
                    signer = new RSASSASigner(loadPrivateKey());
                }
            }
        }
        return signer;
    }

    private PrivateKey loadPrivateKey() {
        if (!properties.signingConfigured()) {
            throw new ExternalServiceException("Video playback",
                    new IllegalStateException("Mux signing key is not configured"));
        }
        String pem = new String(Base64.getDecoder().decode(properties.signingPrivateKey().trim()), StandardCharsets.UTF_8);
        try (PEMParser parser = new PEMParser(new StringReader(pem))) {
            Object parsed = parser.readObject();
            JcaPEMKeyConverter converter = new JcaPEMKeyConverter();
            if (parsed instanceof PEMKeyPair keyPair) {
                return converter.getKeyPair(keyPair).getPrivate();
            }
            if (parsed instanceof PrivateKeyInfo keyInfo) {
                return converter.getPrivateKey(keyInfo);
            }
            throw new IllegalStateException("Unsupported Mux signing key format");
        } catch (IOException | IllegalStateException e) {
            throw new ExternalServiceException("Video playback", e);
        }
    }
}
