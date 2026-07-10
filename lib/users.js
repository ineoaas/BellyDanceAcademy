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

// Checks a login attempt and says *why* it failed, not just pass/fail —
// a pending instructor application needs a different message than a
// plain wrong password. { ok: true, user } on success, otherwise
// { ok: false, reason: "invalid" | "pending" }. Suspended accounts are
// deliberately folded into "invalid" so a suspended user can't use this
// to confirm their account still exists.
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

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  checkLogin,
  listPendingInstructorApplications,
  updateUserPassword,
};
