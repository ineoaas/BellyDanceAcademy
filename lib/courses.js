const db = require("./db");
const { getReviewSummary } = require("./reviews");

/* Joins in the instructor's name (display) and Stripe Connect status
   (so the purchase flow can tell if the course is payable yet). */
const COURSE_COLUMNS = `
  courses.*,
  users.name AS instructor_name,
  users.stripe_account_id AS instructor_stripe_account_id,
  users.stripe_payouts_enabled AS instructor_payouts_enabled
`;

function findCourseBySlug(slug) {
  return db
    .prepare(
      `SELECT ${COURSE_COLUMNS} FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE courses.slug = ?`
    )
    .get(slug);
}

function findCourseById(id) {
  return db
    .prepare(
      `SELECT ${COURSE_COLUMNS} FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE courses.id = ?`
    )
    .get(id);
}

// Filters is a plain object — { style, level, instructorId, minPrice,
// maxPrice, q, sort } — all optional. Both the plain catalog and the
// filtered/searched view share this one query rather than diverging.
function listLiveCourses(filters = {}) {
  const conditions = [`courses.status = 'live'`];
  const params = [];

  if (filters.style) {
    conditions.push(`courses.style = ?`);
    params.push(filters.style);
  }
  if (filters.level) {
    conditions.push(`courses.level = ?`);
    params.push(filters.level);
  }
  if (filters.instructorId) {
    conditions.push(`courses.instructor_id = ?`);
    params.push(filters.instructorId);
  }
  if (filters.minPrice != null) {
    conditions.push(`courses.price_cents >= ?`);
    params.push(Math.round(filters.minPrice * 100));
  }
  if (filters.maxPrice != null) {
    conditions.push(`courses.price_cents <= ?`);
    params.push(Math.round(filters.maxPrice * 100));
  }
  if (filters.q) {
    conditions.push(`(courses.title LIKE ? OR courses.description LIKE ?)`);
    const likeTerm = `%${filters.q}%`;
    params.push(likeTerm, likeTerm);
  }

  const orderBy =
    {
      price_asc: "courses.price_cents ASC",
      price_desc: "courses.price_cents DESC",
      newest: "courses.created_at DESC",
    }[filters.sort] ?? "courses.created_at DESC";

  return db
    .prepare(
      `SELECT ${COURSE_COLUMNS} FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY ${orderBy}`
    )
    .all(...params);
}

function listDistinctStyles() {
  return db
    .prepare(`SELECT DISTINCT style FROM courses WHERE style != '' AND status = 'live' ORDER BY style ASC`)
    .all()
    .map((row) => row.style);
}

function listCoursesByInstructor(instructorId) {
  return db
    .prepare(`SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC`)
    .all(instructorId);
}

function listPendingCourses() {
  return db
    .prepare(
      `SELECT ${COURSE_COLUMNS} FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE courses.status = 'pending'
       ORDER BY courses.created_at ASC`
    )
    .all();
}

function setCourseStatus(courseId, status) {
  db.prepare(`UPDATE courses SET status = ? WHERE id = ?`).run(status, courseId);
}

function getLessonsForCourse(courseId) {
  return db
    .prepare(`SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC`)
    .all(courseId);
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateUniqueCourseSlug(title) {
  const base = slugify(title) || "course";
  let slug = base;
  let suffix = 2;
  while (db.prepare(`SELECT 1 FROM courses WHERE slug = ?`).get(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

// New courses start out `pending` — they only go live once an admin
// approves them (see app/admin/courses). Editing an already-live course
// (updateCourse, below) does NOT touch status — re-reviewing every edit
// would fight NFR-4's "minimal admin work."
function createCourse({ instructorId, title, description, about, level, price, originalPrice, style, durationLabel }) {
  const slug = generateUniqueCourseSlug(title);
  const letter = title.trim()[0]?.toUpperCase() ?? "?";

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO courses
         (slug, title, instructor_id, level, price_cents, original_price_cents,
          description, about, duration_label, letter, style, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .run(
      slug,
      title,
      instructorId,
      level,
      Math.round(price * 100),
      originalPrice ? Math.round(originalPrice * 100) : null,
      description,
      about,
      durationLabel,
      letter,
      style
    );

  return findCourseById(lastInsertRowid);
}

function updateCourse(courseId, { title, description, about, level, price, originalPrice, style, durationLabel }) {
  db.prepare(
    `UPDATE courses SET
       title = ?, description = ?, about = ?, level = ?,
       price_cents = ?, original_price_cents = ?, style = ?, duration_label = ?
     WHERE id = ?`
  ).run(
    title,
    description,
    about,
    level,
    Math.round(price * 100),
    originalPrice ? Math.round(originalPrice * 100) : null,
    style,
    durationLabel,
    courseId
  );
  return findCourseById(courseId);
}

// Turns a 0-5 average into a star string — rounded to the nearest whole
// star since the design doesn't render half-stars.
function starString(average) {
  const filled = Math.round(average);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/* Reshapes a DB row (cents, snake_case) into the display shape
   CourseCard/CourseDetailView already expect from lib/mockData.js. Rating
   comes live from lib/reviews.js now — the old rating_label/rating_value/
   review_count columns were placeholder figures pending a real review
   system (Phase 2), which now exists. */
function formatCourseForDisplay(course) {
  const { average, count } = getReviewSummary(course.id);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    instructor: course.instructor_name,
    level: course.level,
    style: course.style,
    price: course.price_cents / 100,
    originalPrice: course.original_price_cents ? course.original_price_cents / 100 : null,
    rating: count > 0 ? starString(average) : "",
    ratingValue: count > 0 ? average.toFixed(1) : null,
    reviewCount: count,
    lessons: course.lesson_count,
    duration: course.duration_label,
    letter: course.letter,
    desc: course.description,
    about: course.about,
  };
}

module.exports = {
  findCourseBySlug,
  findCourseById,
  listLiveCourses,
  listDistinctStyles,
  listCoursesByInstructor,
  listPendingCourses,
  setCourseStatus,
  getLessonsForCourse,
  createCourse,
  updateCourse,
  formatCourseForDisplay,
};
