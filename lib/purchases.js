const db = require("./db");

function hasPurchased(studentId, courseId) {
  const row = db
    .prepare(`SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ?`)
    .get(studentId, courseId);
  return Boolean(row);
}

// Used by review submission — a review's purchase_id is what "verified
// purchaser" actually means, not just a boolean.
function findPurchaseForStudent(studentId, courseId) {
  return db
    .prepare(`SELECT * FROM purchases WHERE student_id = ? AND course_id = ?`)
    .get(studentId, courseId);
}

/*
 * Writes the purchase + enrollment in one transaction so a student is
 * never paid-without-access or enrolled-without-payment. Stripe can
 * redeliver the same webhook, so a known checkout session id is
 * treated as a no-op rather than recorded twice.
 */
function recordPurchase({
  studentId,
  courseId,
  amountCents,
  commissionCents,
  instructorEarningsCents,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
}) {
  const existing = db
    .prepare(`SELECT * FROM purchases WHERE stripe_checkout_session_id = ?`)
    .get(stripeCheckoutSessionId);
  if (existing) return { purchase: existing, isNew: false };

  const insertPurchaseAndEnrollment = db.transaction(() => {
    const { lastInsertRowid: purchaseId } = db
      .prepare(
        `INSERT INTO purchases
           (student_id, course_id, amount_cents, commission_cents, instructor_earnings_cents,
            stripe_checkout_session_id, stripe_payment_intent_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        studentId,
        courseId,
        amountCents,
        commissionCents,
        instructorEarningsCents,
        stripeCheckoutSessionId,
        stripePaymentIntentId
      );

    db.prepare(
      `INSERT INTO enrollments (student_id, course_id, purchase_id) VALUES (?, ?, ?)`
    ).run(studentId, courseId, purchaseId);

    return purchaseId;
  });

  const purchaseId = insertPurchaseAndEnrollment();
  const purchase = db.prepare(`SELECT * FROM purchases WHERE id = ?`).get(purchaseId);
  return { purchase, isNew: true };
}

function listEnrollmentsForStudent(studentId) {
  return db
    .prepare(
      `SELECT enrollments.*, courses.slug, courses.title, courses.letter,
              users.name AS instructor_name
       FROM enrollments
       JOIN courses ON courses.id = enrollments.course_id
       JOIN users ON users.id = courses.instructor_id
       WHERE enrollments.student_id = ?
       ORDER BY enrollments.created_at DESC`
    )
    .all(studentId);
}

/* Per-course student count + revenue, computed straight from
   purchases/enrollments — no separate analytics table needed. */
function listCourseStatsForInstructor(instructorId) {
  return db
    .prepare(
      `SELECT
         courses.id, courses.slug, courses.title, courses.status,
         COUNT(enrollments.id) AS student_count,
         COALESCE(SUM(purchases.instructor_earnings_cents), 0) AS revenue_cents
       FROM courses
       LEFT JOIN enrollments ON enrollments.course_id = courses.id
       LEFT JOIN purchases ON purchases.id = enrollments.purchase_id
       WHERE courses.instructor_id = ?
       GROUP BY courses.id
       ORDER BY courses.created_at DESC`
    )
    .all(instructorId);
}

// Used for the Home page's real stat tiles, replacing the old hardcoded
// "15,000+ Students" claim.
function countEnrolledStudents() {
  const { count } = db.prepare(`SELECT COUNT(DISTINCT student_id) AS count FROM enrollments`).get();
  return count;
}

// For the admin Overview page's real stat tiles.
function getPlatformStats() {
  const { revenueCents } = db
    .prepare(`SELECT COALESCE(SUM(commission_cents), 0) AS revenueCents FROM purchases`)
    .get();
  const { enrollmentCount } = db.prepare(`SELECT COUNT(*) AS enrollmentCount FROM enrollments`).get();
  return { revenueCents, enrollmentCount };
}

module.exports = {
  hasPurchased,
  countEnrolledStudents,
  getPlatformStats,
  findPurchaseForStudent,
  recordPurchase,
  listEnrollmentsForStudent,
  listCourseStatsForInstructor,
};
