const db = require("./db");

function isWishlisted(studentId, courseId) {
  const row = db
    .prepare(`SELECT 1 FROM wishlist_items WHERE student_id = ? AND course_id = ?`)
    .get(studentId, courseId);
  return Boolean(row);
}

function listWishlistForStudent(studentId) {
  return db
    .prepare(
      `SELECT wishlist_items.*, courses.slug, courses.title, courses.letter,
              courses.price_cents, users.name AS instructor_name
       FROM wishlist_items
       JOIN courses ON courses.id = wishlist_items.course_id
       JOIN users ON users.id = courses.instructor_id
       WHERE wishlist_items.student_id = ?
       ORDER BY wishlist_items.created_at DESC`
    )
    .all(studentId);
}

// Simple toggle rather than separate add/remove actions — the UI only
// ever needs "flip the current state."
function toggleWishlistItem(studentId, courseId) {
  if (isWishlisted(studentId, courseId)) {
    db.prepare(`DELETE FROM wishlist_items WHERE student_id = ? AND course_id = ?`).run(studentId, courseId);
    return false;
  }
  db.prepare(`INSERT INTO wishlist_items (student_id, course_id) VALUES (?, ?)`).run(studentId, courseId);
  return true;
}

module.exports = { isWishlisted, listWishlistForStudent, toggleWishlistItem };
