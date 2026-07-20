const db = require("./db");
const { hashPassword, verifyPassword } = require("./password");

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
}

function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function createUser({ name, email, password, role, status = "active" }) {
  const { salt, hash } = hashPassword(password);
  db.prepare(
    `INSERT INTO users (name, email, password_hash, password_salt, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(name, email.toLowerCase(), hash, salt, role, status);
  return findUserByEmail(email);
}

/*
 * Reports *why* a login failed, not just pass/fail: { ok: true, user }
 * or { ok: false, reason: "invalid" | "pending" }. Suspended accounts
 * are folded into "invalid" so they can't be fingerprinted this way.
 */
function checkLogin(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, reason: "invalid" };
  if (!verifyPassword(password, user.password_salt, user.password_hash)) {
    return { ok: false, reason: "invalid" };
  }
  if (user.status === "pending") return { ok: false, reason: "pending" };
  if (user.status !== "active") return { ok: false, reason: "invalid" };
  return { ok: true, user };
}

function listPendingInstructorApplications() {
  return db
    .prepare(
      `SELECT id, name, email, created_at FROM users
       WHERE role = 'instructor' AND status = 'pending'
       ORDER BY created_at DESC`
    )
    .all();
}

function updateUserPassword(userId, newPassword) {
  const { salt, hash } = hashPassword(newPassword);
  db.prepare(
    `UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?`
  ).run(hash, salt, userId);
  return findUserById(userId);
}

function updateProfile(userId, { name, email }) {
  db.prepare(`UPDATE users SET name = ?, email = ? WHERE id = ?`).run(name, email.toLowerCase(), userId);
  return findUserById(userId);
}

function listAllUsers() {
  return db.prepare(`SELECT * FROM users ORDER BY created_at DESC`).all();
}

// Powers both "suspend/activate" and instructor-application approve/reject
// — all four are really just "set the status column."
function setUserStatus(userId, status) {
  db.prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status, userId);
  return findUserById(userId);
}

// A user referenced by a course, purchase, or review can't be safely hard
// deleted — SQLite here doesn't enforce the foreign keys, so doing it
// anyway would silently orphan rows instead of erroring.
function userHasDependents(userId) {
  const dependent =
    db.prepare(`SELECT 1 FROM courses WHERE instructor_id = ?`).get(userId) ||
    db.prepare(`SELECT 1 FROM purchases WHERE student_id = ?`).get(userId) ||
    db.prepare(`SELECT 1 FROM reviews WHERE student_id = ?`).get(userId);
  return Boolean(dependent);
}

// Sessions/reset tokens aren't "dependents" in the sense userHasDependents
// checks — they're just auth bookkeeping — but they're cleaned up here too
// rather than left as dead rows pointing at a deleted user.
const deleteUserAndAuthArtifacts = db.transaction((userId) => {
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
});

function deleteUser(userId) {
  deleteUserAndAuthArtifacts(userId);
}

function setStripeAccountId(userId, stripeAccountId) {
  db.prepare(`UPDATE users SET stripe_account_id = ? WHERE id = ?`).run(stripeAccountId, userId);
  return findUserById(userId);
}

function setStripePayoutsEnabled(userId, enabled) {
  db.prepare(`UPDATE users SET stripe_payouts_enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, userId);
  return findUserById(userId);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  checkLogin,
  listPendingInstructorApplications,
  listAllUsers,
  setUserStatus,
  userHasDependents,
  deleteUser,
  updateUserPassword,
  updateProfile,
  setStripeAccountId,
  setStripePayoutsEnabled,
};
