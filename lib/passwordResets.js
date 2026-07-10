const crypto = require("node:crypto");
const db = require("./db");

const TOKEN_TTL_MINUTES = 60;

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// Creates a fresh reset token for a user, wiping out any earlier ones they
// had outstanding, only the most recently requested link should work.
// Returns the raw token; only its hash is ever stored.
function createResetToken(userId) {
  db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).run(userId);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)`
  ).run(hashToken(rawToken), userId, expiresAt);

  return rawToken;
}

// Returns the user id behind a valid, unexpired token, or null. Doesn't
// consume it, call deleteResetToken separately once the password is
// actually changed, so a reset attempt that fails validation elsewhere
// doesn't burn the user's only working link.
function findUserIdByResetToken(rawToken) {
  const row = db
    .prepare(
      `SELECT user_id FROM password_reset_tokens
       WHERE token_hash = ? AND expires_at > datetime('now')`
    )
    .get(hashToken(rawToken));
  return row ? row.user_id : null;
}

function deleteResetToken(rawToken) {
  db.prepare(`DELETE FROM password_reset_tokens WHERE token_hash = ?`).run(hashToken(rawToken));
}

module.exports = { createResetToken, findUserIdByResetToken, deleteResetToken };
