const db = require("./db");

function getLessonProgressForStudent(studentId, lessonId) {
  return db
    .prepare(`SELECT * FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
    .get(studentId, lessonId);
}

// seconds_watched tracks the furthest point ever reached in this lesson
// (so a later rewind doesn't undo "completed"), independent of
// enrollments.last_position_seconds, which is just "where to resume" and
// can be anywhere the student currently is.
function upsertLessonProgress({ studentId, lessonId, secondsWatched, completed }) {
  db.prepare(
    `INSERT INTO lesson_progress (student_id, lesson_id, seconds_watched, completed)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(student_id, lesson_id) DO UPDATE SET
       seconds_watched = MAX(seconds_watched, excluded.seconds_watched),
       completed = MAX(completed, excluded.completed),
       updated_at = datetime('now')`
  ).run(studentId, lessonId, Math.round(secondsWatched), completed ? 1 : 0);
}

function updateResumePoint(studentId, courseId, lessonId, positionSeconds) {
  db.prepare(
    `UPDATE enrollments SET last_lesson_id = ?, last_position_seconds = ?
     WHERE student_id = ? AND course_id = ?`
  ).run(lessonId, Math.round(positionSeconds), studentId, courseId);
}

function recalculateCourseProgress(studentId, courseId) {
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?`)
    .get(courseId);
  const { completedCount } = db
    .prepare(
      `SELECT COUNT(*) AS completedCount FROM lesson_progress
       JOIN lessons ON lessons.id = lesson_progress.lesson_id
       WHERE lesson_progress.student_id = ? AND lessons.course_id = ? AND lesson_progress.completed = 1`
    )
    .get(studentId, courseId);

  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  db.prepare(`UPDATE enrollments SET progress_percent = ? WHERE student_id = ? AND course_id = ?`).run(
    percent,
    studentId,
    courseId
  );
  return percent;
}

// The one call the progress-reporting server action needs — updates the
// lesson's own progress, the course's overall resume point, and the
// recalculated percent, all together since they always change as a unit.
function recordLessonProgress({ studentId, courseId, lessonId, positionSeconds, durationSeconds }) {
  const completed = durationSeconds > 0 && positionSeconds >= durationSeconds * 0.9;
  upsertLessonProgress({ studentId, lessonId, secondsWatched: positionSeconds, completed });
  updateResumePoint(studentId, courseId, lessonId, positionSeconds);
  return recalculateCourseProgress(studentId, courseId);
}

module.exports = {
  getLessonProgressForStudent,
  recordLessonProgress,
};
