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

// The admin-facing ledger — read-only, since Stripe already moves the
// money automatically (see lib/actions/instructorStripe.js); there's
// nothing for an admin to "process," just to see.
function listAllPayouts() {
  return db
    .prepare(
      `SELECT payouts.*, users.name AS instructor_name
       FROM payouts
       JOIN users ON users.id = payouts.instructor_id
       ORDER BY payouts.requested_at DESC`
    )
    .all();
}

module.exports = { listPayoutsForInstructor, recordPayout, listAllPayouts };
