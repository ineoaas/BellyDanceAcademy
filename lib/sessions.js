const crypto = require("node:crypto");
const db = require("./db");

const SESSION_LENGTH_DAYS = 30;

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_LENGTH_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
  ).run(token, userId, expiresAt);

  return { token, expiresAt };
}

// Looks up the user behind a session token, or null if the token doesn't
// exist, is expired, or belongs to a suspended account.
function getSessionUser(token) {
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT users.* FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.token = ?
           AND sessions.expires_at > datetime('now')
           AND users.status = 'active'`
      )
      .get(token) || null
  );
}

function destroySession(token) {
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

module.exports = { createSession, getSessionUser, destroySession, SESSION_LENGTH_DAYS };
