const { createUser, findUserByEmail } = require("../lib/users");
const { upsertProfile } = require("../lib/instructorProfiles");
const db = require("../lib/db");
const { COURSES, INSTRUCTORS } = require("../lib/mockData");

const DEMO_ACCOUNTS = [
  { name: "Nadia Karim", email: "student@example.com", password: "student123", role: "student" },
  { name: "Amara Nour", email: "instructor@example.com", password: "instructor123", role: "instructor" },
  { name: "Leyla Marín", email: "leyla@example.com", password: "instructor123", role: "instructor" },
  { name: "Dalia Rostam", email: "dalia@example.com", password: "instructor123", role: "instructor" },
  { name: "Farah Idris", email: "farah@example.com", password: "instructor123", role: "instructor" },
  { name: "Site Admin", email: "admin@example.com", password: "admin123", role: "admin" },
];

/* Links each mock course to a real instructor account by name, since
   lib/mockData.js only ever stored a display name, not an account. */
const INSTRUCTOR_EMAIL_BY_NAME = {
  "Amara Nour": "instructor@example.com",
  "Leyla Marín": "leyla@example.com",
  "Dalia Rostam": "dalia@example.com",
  "Farah Idris": "farah@example.com",
};

// Short, genuine-sounding bio copy per instructor — not fabricated stats,
// just the kind of profile text a real instructor would fill in themselves.
const INSTRUCTOR_BIOS = {
  "Amara Nour": {
    bio: "Cairo-trained in Baladi and Saidi, with over a decade performing on Egypt's wedding and hotel-show circuit before moving to teaching full time.",
    credentials: "10+ years performing, Cairo",
  },
  "Leyla Marín": {
    bio: "A veil-work specialist blending Spanish theatrical training with classical Oriental technique, now teaching dancers preparing for their first solo.",
    credentials: "Conservatory-trained, Barcelona",
  },
  "Dalia Rostam": {
    bio: "Known for sharp, percussive drum solo work built on years of live tabla accompaniment across Istanbul's performance venues.",
    credentials: "Istanbul performance circuit",
  },
  "Farah Idris": {
    bio: "A finishing-school approach to arm and hand styling — the small technical details that separate trained movement from improvised.",
    credentials: "Beirut studio instructor",
  },
};

for (const account of DEMO_ACCOUNTS) {
  if (findUserByEmail(account.email)) {
    console.log(`Skipping ${account.email} — already exists`);
    continue;
  }
  createUser(account);
  console.log(`Created ${account.role}: ${account.email} / ${account.password}`);
}

for (const mockInstructor of INSTRUCTORS) {
  const email = INSTRUCTOR_EMAIL_BY_NAME[mockInstructor.name];
  const user = email && findUserByEmail(email);
  if (!user) continue;

  const details = INSTRUCTOR_BIOS[mockInstructor.name] ?? { bio: "", credentials: "" };
  upsertProfile(user.id, { name: user.name, city: mockInstructor.city, ...details });
}
console.log("Seeded instructor profiles.");

// FR-2.4's style filter needs something to filter by — mockData.js
// predates the `style` column, so it's mapped here by slug instead.
const STYLE_BY_SLUG = {
  "egyptian-baladi-foundations": "Baladi",
  "veil-work-stage-presence": "Veil Work",
  "drum-solo-choreography": "Drum Solo",
  "arm-hand-styling-essentials": "Styling",
  "saidi-cane-dance": "Saidi",
  "five-minute-solo": "Choreography",
};

const insertCourse = db.prepare(`
  INSERT INTO courses
    (slug, title, instructor_id, level, price_cents, original_price_cents,
     description, about, duration_label, lesson_count, letter, style,
     rating_label, rating_value, review_count, status)
  VALUES (@slug, @title, @instructorId, @level, @priceCents, @originalPriceCents,
          @description, @about, @durationLabel, @lessonCount, @letter, @style,
          @ratingLabel, @ratingValue, @reviewCount, 'live')
`);

const insertLesson = db.prepare(`
  INSERT INTO lessons (course_id, position, title, duration_label, is_preview)
  VALUES (?, ?, ?, ?, ?)
`);

for (const course of COURSES) {
  const existing = db.prepare(`SELECT id FROM courses WHERE slug = ?`).get(course.slug);
  if (existing) {
    console.log(`Skipping course ${course.slug} — already exists`);
    continue;
  }

  const instructorEmail = INSTRUCTOR_EMAIL_BY_NAME[course.instructor];
  const instructor = instructorEmail && findUserByEmail(instructorEmail);
  if (!instructor) {
    console.log(`Skipping course ${course.slug} — no instructor account for "${course.instructor}"`);
    continue;
  }

  const { lastInsertRowid: courseId } = insertCourse.run({
    slug: course.slug,
    title: course.title,
    instructorId: instructor.id,
    level: course.level,
    priceCents: Math.round(course.price * 100),
    originalPriceCents: Math.round(course.originalPrice * 100),
    description: course.desc,
    about: course.about,
    durationLabel: course.duration,
    lessonCount: course.lessons,
    letter: course.letter,
    style: STYLE_BY_SLUG[course.slug] ?? "",
    ratingLabel: course.rating,
    ratingValue: course.ratingValue,
    reviewCount: course.reviewCount,
  });

  course.curriculum.forEach((lesson, index) => {
    insertLesson.run(courseId, index + 1, lesson.title, lesson.time, lesson.preview ? 1 : 0);
  });

  console.log(`Created course: ${course.slug} (${course.curriculum.length} lessons)`);
}
