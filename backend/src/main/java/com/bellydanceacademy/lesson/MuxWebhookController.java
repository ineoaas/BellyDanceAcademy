package com.bellydanceacademy.lesson;

import com.bellydanceacademy.common.error.ProblemDetails;
import com.bellydanceacademy.video.MuxWebhookVerifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Mux calls this once it finishes processing an upload. Transcoding happens
 * after the browser upload completes, so this is the only place that knows
 * when a lesson's video is actually playable.
 */
@RestController
@RequestMapping("/api/webhooks/mux")
class MuxWebhookController {

    private final MuxWebhookVerifier verifier;
    private final LessonVideoService lessonVideos;
    private final JsonMapper jsonMapper;

    MuxWebhookController(MuxWebhookVerifier verifier, LessonVideoService lessonVideos, JsonMapper jsonMapper) {
        this.verifier = verifier;
        this.lessonVideos = lessonVideos;
        this.jsonMapper = jsonMapper;
    }

    @PostMapping
    ResponseEntity<?> receive(@RequestBody String rawBody,
                              @RequestHeader(name = "Mux-Signature", required = false) String signature) {
        if (!verifier.isValid(rawBody, signature)) {
            return ResponseEntity.badRequest().body(ProblemDetails.of(HttpStatus.BAD_REQUEST, "INVALID_SIGNATURE",
                    "Invalid webhook signature."));
        }

        JsonNode event = jsonMapper.readTree(rawBody);
        JsonNode data = event.path("data");
        switch (event.path("type").asString("")) {
            case "video.upload.asset_created" -> {
                if (data.hasNonNull("asset_id")) {
                    lessonVideos.onAssetCreated(data.path("id").asString(), data.path("asset_id").asString());
                }
            }
            case "video.asset.ready" -> {
                JsonNode playbackId = data.path("playback_ids").path(0).path("id");
                if (!playbackId.isMissingNode()) {
                    lessonVideos.onAssetReady(data.path("id").asString(), playbackId.asString(),
                            data.path("duration").asDouble(0));
                }
            }
            case "video.asset.errored" -> lessonVideos.onAssetErrored(data.path("id").asString());
            default -> { }
        }
        return ResponseEntity.ok().build();
    }
}
