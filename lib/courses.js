const db = require("./db");

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

function listLiveCourses() {
  return db
    .prepare(
      `SELECT ${COURSE_COLUMNS} FROM courses
       JOIN users ON users.id = courses.instructor_id
       WHERE courses.status = 'live'
       ORDER BY courses.created_at DESC`
    )
    .all();
}

function listCoursesByInstructor(instructorId) {
  return db
    .prepare(`SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC`)
    .all(instructorId);
}

function getLessonsForCourse(courseId) {
  return db
    .prepare(`SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC`)
    .all(courseId);
}

/* Reshapes a DB row (cents, snake_case) into the display shape
   CourseCard/CourseDetailView already expect from lib/mockData.js. */
function formatCourseForDisplay(course) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    instructor: course.instructor_name,
    level: course.level,
    price: course.price_cents / 100,
    originalPrice: course.original_price_cents ? course.original_price_cents / 100 : null,
    rating: course.rating_label,
    ratingValue: course.rating_value,
    reviewCount: course.review_count,
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
  listCoursesByInstructor,
  getLessonsForCourse,
  formatCourseForDisplay,
};
