const db = require("./db");
const { hashPassword, verifyPassword } = require("./password");

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
}

function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function createUser({ name, email, password, role }) {
  const { salt, hash } = hashPassword(password);
  db.prepare(
    `INSERT INTO users (name, email, password_hash, password_salt, role)
     VALUES (?, ?, ?, ?, ?)`
  ).run(name, email.toLowerCase(), hash, salt, role);
  return findUserByEmail(email);
}

// Returns the matching user row on success, or null if the email doesn't
// exist, the password is wrong, or the account has been suspended.
function verifyCredentials(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.status !== "active") return null;
  if (!verifyPassword(password, user.password_salt, user.password_hash)) return null;
  return user;
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
  verifyCredentials,
  updateUserPassword,
};
