const db = require("./db");

function listPayoutsForInstructor(instructorId) {
  return db
    .prepare(`SELECT * FROM payouts WHERE instructor_id = ? ORDER BY requested_at DESC`)
    .all(instructorId);
}

function recordPayout({ instructorId, amountCents, stripePayoutId, status }) {
  db.prepare(
    `INSERT INTO payouts (instructor_id, amount_cents, stripe_payout_id, status) VALUES (?, ?, ?, ?)`
  ).run(instructorId, amountCents, stripePayoutId, status);
}

module.exports = { listPayoutsForInstructor, recordPayout };
