const db = require("./db");

// Used everywhere a rating displays (course cards, detail page) — real
// average/count over visible reviews, replacing the placeholder numbers
// that used to live directly on the courses row.
function getReviewSummary(courseId) {
  const row = db
    .prepare(
      `SELECT AVG(rating) AS average, COUNT(*) AS count
       FROM reviews WHERE course_id = ? AND status = 'visible'`
    )
    .get(courseId);
  return { average: row.average ?? 0, count: row.count };
}

function findReviewByStudent(studentId, courseId) {
  return db.prepare(`SELECT * FROM reviews WHERE student_id = ? AND course_id = ?`).get(studentId, courseId);
}

// One review per (student, course) — resubmitting updates the existing one
// rather than creating a second row.
function upsertReview({ studentId, courseId, purchaseId, rating, comment }) {
  db.prepare(
    `INSERT INTO reviews (student_id, course_id, purchase_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(student_id, course_id) DO UPDATE SET
       rating = excluded.rating,
       comment = excluded.comment,
       status = 'visible'`
  ).run(studentId, courseId, purchaseId, rating, comment);
}

function listVisibleReviewsForCourse(courseId) {
  return db
    .prepare(
      `SELECT reviews.*, users.name AS student_name
       FROM reviews
       JOIN users ON users.id = reviews.student_id
       WHERE reviews.course_id = ? AND reviews.status = 'visible'
       ORDER BY reviews.created_at DESC`
    )
    .all(courseId);
}

function listAllReviewsForAdmin() {
  return db
    .prepare(
      `SELECT reviews.*, users.name AS student_name, courses.title AS course_title, courses.slug AS course_slug
       FROM reviews
       JOIN users ON users.id = reviews.student_id
       JOIN courses ON courses.id = reviews.course_id
       ORDER BY reviews.created_at DESC`
    )
    .all();
}

function setReviewStatus(reviewId, status) {
  db.prepare(`UPDATE reviews SET status = ? WHERE id = ?`).run(status, reviewId);
}

// For the Home page testimonial — a real review with actual text, not the
// hardcoded quote that used to sit there. Null until someone's left one.
function getFeaturedReview() {
  return db
    .prepare(
      `SELECT reviews.*, users.name AS student_name
       FROM reviews
       JOIN users ON users.id = reviews.student_id
       WHERE reviews.status = 'visible' AND reviews.comment != ''
       ORDER BY reviews.rating DESC, reviews.created_at DESC
       LIMIT 1`
    )
    .get();
}

module.exports = {
  getReviewSummary,
  findReviewByStudent,
  upsertReview,
  listVisibleReviewsForCourse,
  listAllReviewsForAdmin,
  setReviewStatus,
  getFeaturedReview,
};
