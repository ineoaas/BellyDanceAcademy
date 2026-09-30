package com.bellydanceacademy.lesson;

/** A lesson video's lifecycle: NONE → UPLOADING → PROCESSING → READY (or ERRORED). */
public enum VideoStatus {
    NONE,
    UPLOADING,
    PROCESSING,
    READY,
    ERRORED
}
