const db = require("./db");

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Appends -2, -3, etc. only if the plain slug is already taken — most
// instructors never collide with anyone.
function generateUniqueSlug(name) {
  const base = slugify(name) || "instructor";
  let slug = base;
  let suffix = 2;
  while (db.prepare(`SELECT 1 FROM instructor_profiles WHERE slug = ?`).get(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function findProfileBySlug(slug) {
  return db
    .prepare(
      `SELECT instructor_profiles.*, users.name, users.id AS user_id
       FROM instructor_profiles
       JOIN users ON users.id = instructor_profiles.user_id
       WHERE instructor_profiles.slug = ?`
    )
    .get(slug);
}

function findProfileByUserId(userId) {
  return db.prepare(`SELECT * FROM instructor_profiles WHERE user_id = ?`).get(userId);
}

// Instructors only show up on /instructors once they've saved a profile —
// an approved instructor with nothing filled in yet doesn't show an empty page.
function listInstructorsWithProfiles() {
  return db
    .prepare(
      `SELECT instructor_profiles.*, users.name,
              COUNT(courses.id) AS course_count
       FROM instructor_profiles
       JOIN users ON users.id = instructor_profiles.user_id
       LEFT JOIN courses ON courses.instructor_id = users.id AND courses.status = 'live'
       GROUP BY instructor_profiles.id
       ORDER BY users.name ASC`
    )
    .all();
}

function upsertProfile(userId, { name, city, bio, credentials }) {
  const existing = findProfileByUserId(userId);
  if (existing) {
    db.prepare(
      `UPDATE instructor_profiles SET city = ?, bio = ?, credentials = ? WHERE user_id = ?`
    ).run(city, bio, credentials, userId);
    return findProfileByUserId(userId);
  }

  const slug = generateUniqueSlug(name);
  db.prepare(
    `INSERT INTO instructor_profiles (user_id, slug, city, bio, credentials)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userId, slug, city, bio, credentials);
  return findProfileByUserId(userId);
}

module.exports = {
  findProfileBySlug,
  findProfileByUserId,
  listInstructorsWithProfiles,
  upsertProfile,
};
