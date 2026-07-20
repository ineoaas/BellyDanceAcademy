const path = require("node:path");
const fs = require("node:fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

/* Schema setup — no-op if tables already exist. */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    level TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    original_price_cents INTEGER,
    description TEXT NOT NULL DEFAULT '',
    about TEXT NOT NULL DEFAULT '',
    duration_label TEXT NOT NULL DEFAULT '',
    lesson_count INTEGER NOT NULL DEFAULT 0,
    letter TEXT NOT NULL DEFAULT '',
    /* Placeholder figures carried over from mock data, not real
       reviews yet (FR-2.3, later phase). */
    rating_label TEXT NOT NULL DEFAULT '',
    rating_value TEXT NOT NULL DEFAULT '',
    review_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('draft', 'pending', 'live', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    duration_label TEXT NOT NULL DEFAULT '',
    is_preview INTEGER NOT NULL DEFAULT 0
  );

  /* One row per payment. Amounts are snapshotted at purchase time so a
     later commission rate change never rewrites history. */
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    amount_cents INTEGER NOT NULL,
    commission_cents INTEGER NOT NULL,
    instructor_earnings_cents INTEGER NOT NULL,
    stripe_checkout_session_id TEXT NOT NULL UNIQUE,
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  /* The entitlement itself — written alongside the purchase row, never before. */
  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    purchase_id INTEGER NOT NULL REFERENCES purchases(id),
    progress_percent INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (student_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER NOT NULL REFERENCES users(id),
    amount_cents INTEGER NOT NULL,
    stripe_payout_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    requested_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  /* Single-row table (id always 1). DB-backed so a future admin
     screen can change the commission rate without a redeploy. */
  CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    commission_rate_percent INTEGER NOT NULL DEFAULT 20
  );

  /* One row per (student, lesson). enrollments.progress_percent is
     recalculated from these rows whenever one changes, rather than
     computed live on every page view. */
  CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    seconds_watched INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (student_id, lesson_id)
  );

  /* The InstructorProfile entity from the URS's own data model — deliberately
     separate from users, since an approved instructor may not have filled
     one in yet. Only instructors with a row here show up on /instructors. */
  CREATE TABLE IF NOT EXISTS instructor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    slug TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    credentials TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  /* Only a verified purchaser (purchase_id proves it) can post one review
     per course. New reviews publish immediately — the purchase requirement
     is the real spam gate — but an admin can hide one after the fact. */
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    purchase_id INTEGER NOT NULL REFERENCES purchases(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (student_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (student_id, course_id)
  );

  /* Toggled inactive rather than deleted — same "hide, don't destroy"
     pattern as reviews.status. */
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.prepare(
  `INSERT OR IGNORE INTO platform_settings (id, commission_rate_percent) VALUES (1, 20)`
).run();

/*
 * Migrates a column onto an existing table (CREATE TABLE IF NOT EXISTS
 * won't add it). `table`/`column` are always hardcoded call-site
 * literals below, never user input, so string-building the ALTER TABLE
 * is safe.
 */
function ensureColumn(table, column, definition) {
  const existingColumns = db.prepare(`PRAGMA table_info(${table})`).all();
  const alreadyExists = existingColumns.some((col) => col.name === column);
  if (!alreadyExists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("users", "stripe_account_id", "TEXT");
ensureColumn("users", "stripe_payouts_enabled", "INTEGER NOT NULL DEFAULT 0");

// The upload id is stored the moment we ask Mux for a direct upload —
// before Mux has even received the file — so the webhook can find the
// right lesson once it reports the resulting asset id.
ensureColumn("lessons", "mux_upload_id", "TEXT");
ensureColumn("lessons", "mux_asset_id", "TEXT");
ensureColumn("lessons", "mux_playback_id", "TEXT");
ensureColumn("lessons", "video_status", "TEXT NOT NULL DEFAULT 'none'");
ensureColumn("lessons", "duration_seconds", "INTEGER");

// This pair is what "resume where you left off" (FR-3.8) means in practice.
ensureColumn("enrollments", "last_lesson_id", "INTEGER REFERENCES lessons(id)");
ensureColumn("enrollments", "last_position_seconds", "INTEGER NOT NULL DEFAULT 0");

// Free-text, not a CHECK-constrained enum, so adding a new dance style
// never needs a migration (NFR-9).
ensureColumn("courses", "style", "TEXT NOT NULL DEFAULT ''");

module.exports = db;
