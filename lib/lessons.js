const db = require("./db");

function findLessonById(id) {
  return db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(id);
}

function findLessonByUploadId(uploadId) {
  return db.prepare(`SELECT * FROM lessons WHERE mux_upload_id = ?`).get(uploadId);
}

function findLessonByAssetId(assetId) {
  return db.prepare(`SELECT * FROM lessons WHERE mux_asset_id = ?`).get(assetId);
}

function createLesson({ courseId, title, durationLabel, isPreview }) {
  const { maxPosition } = db
    .prepare(`SELECT COALESCE(MAX(position), 0) AS maxPosition FROM lessons WHERE course_id = ?`)
    .get(courseId);

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO lessons (course_id, position, title, duration_label, is_preview)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(courseId, maxPosition + 1, title, durationLabel, isPreview ? 1 : 0);

  db.prepare(`UPDATE courses SET lesson_count = lesson_count + 1 WHERE id = ?`).run(courseId);

  return findLessonById(lastInsertRowid);
}

// Moves a lesson up or down by swapping `position` with its neighbor —
// the simplest reordering that doesn't need drag-and-drop UI.
function swapLessonPosition(lessonId, direction) {
  const lesson = findLessonById(lessonId);
  if (!lesson) return;

  const neighborPosition = direction === "up" ? lesson.position - 1 : lesson.position + 1;
  const neighbor = db
    .prepare(`SELECT * FROM lessons WHERE course_id = ? AND position = ?`)
    .get(lesson.course_id, neighborPosition);
  if (!neighbor) return;

  const swap = db.transaction(() => {
    db.prepare(`UPDATE lessons SET position = ? WHERE id = ?`).run(neighbor.position, lesson.id);
    db.prepare(`UPDATE lessons SET position = ? WHERE id = ?`).run(lesson.position, neighbor.id);
  });
  swap();
}

function setLessonUploadId(lessonId, uploadId) {
  db.prepare(
    `UPDATE lessons SET mux_upload_id = ?, video_status = 'uploading' WHERE id = ?`
  ).run(uploadId, lessonId);
}

function setLessonAssetId(uploadId, assetId) {
  db.prepare(
    `UPDATE lessons SET mux_asset_id = ?, video_status = 'processing' WHERE mux_upload_id = ?`
  ).run(assetId, uploadId);
}

function markLessonReady(assetId, { playbackId, durationSeconds }) {
  db.prepare(
    `UPDATE lessons
     SET mux_playback_id = ?, duration_seconds = ?, duration_label = ?, video_status = 'ready'
     WHERE mux_asset_id = ?`
  ).run(playbackId, Math.round(durationSeconds), formatDuration(durationSeconds), assetId);
}

function markLessonErrored(assetId) {
  db.prepare(`UPDATE lessons SET video_status = 'errored' WHERE mux_asset_id = ?`).run(assetId);
}

function formatDuration(totalSeconds) {
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

module.exports = {
  findLessonById,
  findLessonByUploadId,
  findLessonByAssetId,
  createLesson,
  swapLessonPosition,
  setLessonUploadId,
  setLessonAssetId,
  markLessonReady,
  markLessonErrored,
};
