const { scryptSync, randomBytes, timingSafeEqual } = require("node:crypto");

const KEY_LENGTH = 64;

function hashPassword(plainPassword) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
  return { salt, hash };
}

function verifyPassword(plainPassword, salt, expectedHash) {
  const actualHash = scryptSync(plainPassword, salt, KEY_LENGTH);
  const expected = Buffer.from(expectedHash, "hex");
  // timingSafeEqual throws if the buffers differ in length, so bail out
  // early instead, a length mismatch just means "not a match".
  if (actualHash.length !== expected.length) return false;
  return timingSafeEqual(actualHash, expected);
}

module.exports = { hashPassword, verifyPassword };
