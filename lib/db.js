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

module.exports = db;
