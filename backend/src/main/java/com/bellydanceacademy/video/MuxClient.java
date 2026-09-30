package com.bellydanceacademy.video;

import com.bellydanceacademy.common.error.ExternalServiceException;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** The one Mux Video API call the app needs: creating a direct upload URL. */
@Component
public class MuxClient {

    private static final String API_BASE_URL = "https://api.mux.com";

    private final MuxProperties properties;
    private final RestClient restClient;

    MuxClient(MuxProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.baseUrl(API_BASE_URL).build();
    }

    /**
     * Returns a URL the browser can PUT the video file to directly, so large
     * uploads never pass through this server.
     *
     * @param publicPlayback preview lessons are public; everything else needs a signed token
     */
    public DirectUpload createDirectUpload(String corsOrigin, boolean publicPlayback) {
        if (!properties.apiConfigured()) {
            throw new ExternalServiceException("Video hosting", new IllegalStateException("Mux API credentials are not configured"));
        }
        Map<String, Object> body = Map.of(
                "cors_origin", corsOrigin,
                "new_asset_settings", Map.of("playback_policies", List.of(publicPlayback ? "public" : "signed")));
        try {
            UploadEnvelope envelope = restClient.post()
                    .uri("/video/v1/uploads")
                    .headers(headers -> headers.setBasicAuth(properties.tokenId(), properties.tokenSecret()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(UploadEnvelope.class);
            if (envelope == null || envelope.data() == null) {
                throw new IllegalStateException("Mux returned an empty upload response");
            }
            return envelope.data();
        } catch (RestClientException | IllegalStateException e) {
            throw new ExternalServiceException("Video hosting", e);
        }
    }

    public record DirectUpload(String id, String url) {
    }

    private record UploadEnvelope(DirectUpload data) {
    }
}
