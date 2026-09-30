package com.bellydanceacademy.lesson;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long courseId;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private String title;

    @Column(name = "is_preview", nullable = false)
    private boolean preview;

    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoStatus videoStatus;

    private String muxUploadId;

    private String muxAssetId;

    private String muxPlaybackId;

    protected Lesson() {
    }

    public Lesson(Long courseId, int position, String title, boolean preview) {
        this.courseId = courseId;
        this.position = position;
        this.title = title.trim();
        this.preview = preview;
        this.videoStatus = VideoStatus.NONE;
    }

    /** For seeding lessons whose length is known before any video exists. */
    public static Lesson withDuration(Long courseId, int position, String title, boolean preview, int durationSeconds) {
        Lesson lesson = new Lesson(courseId, position, title, preview);
        lesson.durationSeconds = durationSeconds;
        return lesson;
    }

    void swapPositionWith(Lesson other) {
        int mine = position;
        position = other.position;
        other.position = mine;
    }

    /** A new upload replaces whatever video the lesson had before. */
    void startUpload(String uploadId) {
        muxUploadId = uploadId;
        muxAssetId = null;
        muxPlaybackId = null;
        videoStatus = VideoStatus.UPLOADING;
    }

    void assetCreated(String assetId) {
        muxAssetId = assetId;
        videoStatus = VideoStatus.PROCESSING;
    }

    void markReady(String playbackId, int durationSeconds) {
        muxPlaybackId = playbackId;
        this.durationSeconds = durationSeconds;
        videoStatus = VideoStatus.READY;
    }

    void markErrored() {
        videoStatus = VideoStatus.ERRORED;
    }

    public boolean hasPlayableVideo() {
        return videoStatus == VideoStatus.READY && muxPlaybackId != null;
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getPosition() {
        return position;
    }

    public String getTitle() {
        return title;
    }

    public boolean isPreview() {
        return preview;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public VideoStatus getVideoStatus() {
        return videoStatus;
    }

    public String getMuxPlaybackId() {
        return muxPlaybackId;
    }
}
