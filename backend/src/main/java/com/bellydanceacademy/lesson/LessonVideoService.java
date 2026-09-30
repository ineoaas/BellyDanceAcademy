package com.bellydanceacademy.lesson;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Applies Mux's processing events to lessons. Mux may deliver events more
 * than once or out of order, so each handler is a no-op when nothing matches.
 */
@Service
class LessonVideoService {

    private static final Logger log = LoggerFactory.getLogger(LessonVideoService.class);

    private final LessonRepository lessons;

    LessonVideoService(LessonRepository lessons) {
        this.lessons = lessons;
    }

    @Transactional
    void onAssetCreated(String uploadId, String assetId) {
        lessons.findByMuxUploadId(uploadId).ifPresentOrElse(
                lesson -> lesson.assetCreated(assetId),
                () -> log.warn("Mux asset {} created for unknown upload {}", assetId, uploadId));
    }

    @Transactional
    void onAssetReady(String assetId, String playbackId, double durationSeconds) {
        lessons.findByMuxAssetId(assetId).ifPresentOrElse(
                lesson -> lesson.markReady(playbackId, (int) Math.round(durationSeconds)),
                () -> log.warn("Mux asset {} ready but no lesson references it", assetId));
    }

    @Transactional
    void onAssetErrored(String assetId) {
        lessons.findByMuxAssetId(assetId).ifPresent(Lesson::markErrored);
    }
}
