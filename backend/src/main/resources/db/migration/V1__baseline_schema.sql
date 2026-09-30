-- Baseline schema for the Belly Dance Academy marketplace.
--
-- Conventions:
--   * Enums are stored as upper-case VARCHARs guarded by CHECK constraints
--     (readable in psql, and adding a value is a one-line migration).
--   * Money is always integer cents; currency lives next to the amount.
--   * Anything a person paid for or wrote (courses, purchases, reviews) is
--     RESTRICTed on user delete; pure bookkeeping rows CASCADE.

CREATE TABLE users (
    id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                   VARCHAR(120) NOT NULL,
    email                  VARCHAR(254) NOT NULL UNIQUE,
    password_hash          VARCHAR(255) NOT NULL,
    role                   VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
    status                 VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED')),
    stripe_account_id      VARCHAR(255),
    stripe_payouts_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_users_role_status ON users (role, status);

-- Only the SHA-256 of a session token is stored, so a leaked table can't be
-- replayed as live sessions.
CREATE TABLE user_sessions (
    token_hash VARCHAR(64) PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_user_sessions_user ON user_sessions (user_id);

CREATE TABLE password_reset_tokens (
    token_hash VARCHAR(64) PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_password_reset_tokens_user ON password_reset_tokens (user_id);

-- Separate from users: an approved instructor may not have written a
-- profile yet, and only instructors with one appear in the public directory.
CREATE TABLE instructor_profiles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    slug        VARCHAR(140) NOT NULL UNIQUE,
    city        VARCHAR(120) NOT NULL DEFAULT '',
    bio         TEXT         NOT NULL DEFAULT '',
    credentials VARCHAR(200) NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE courses (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug                 VARCHAR(160) NOT NULL UNIQUE,
    title                VARCHAR(150) NOT NULL,
    instructor_id        BIGINT       NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    level                VARCHAR(20)  NOT NULL CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    -- Free text rather than an enum so a new dance style never needs a migration.
    style                VARCHAR(60)  NOT NULL DEFAULT '',
    price_cents          INTEGER      NOT NULL CHECK (price_cents > 0),
    original_price_cents INTEGER      CHECK (original_price_cents > 0),
    description          VARCHAR(300) NOT NULL DEFAULT '',
    about                TEXT         NOT NULL DEFAULT '',
    duration_label       VARCHAR(40)  NOT NULL DEFAULT '',
    status               VARCHAR(20)  NOT NULL CHECK (status IN ('DRAFT', 'PENDING', 'LIVE', 'REJECTED')),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_courses_status_created ON courses (status, created_at DESC);
CREATE INDEX ix_courses_instructor ON courses (instructor_id);

CREATE TABLE lessons (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id        BIGINT       NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    position         INTEGER      NOT NULL CHECK (position > 0),
    title            VARCHAR(150) NOT NULL,
    is_preview       BOOLEAN      NOT NULL DEFAULT FALSE,
    duration_seconds INTEGER      CHECK (duration_seconds >= 0),
    video_status     VARCHAR(20)  NOT NULL DEFAULT 'NONE'
                         CHECK (video_status IN ('NONE', 'UPLOADING', 'PROCESSING', 'READY', 'ERRORED')),
    -- Stored the moment an upload URL is issued, so the Mux webhook can find
    -- the lesson before Mux has even assigned an asset id.
    mux_upload_id    VARCHAR(255) UNIQUE,
    mux_asset_id     VARCHAR(255) UNIQUE,
    mux_playback_id  VARCHAR(255),
    -- Deferred so two lessons can swap positions inside one transaction.
    CONSTRAINT uq_lessons_course_position UNIQUE (course_id, position) DEFERRABLE INITIALLY DEFERRED
);

-- One row per payment. Amounts are snapshotted at checkout so a later
-- commission change never rewrites history.
CREATE TABLE purchases (
    id                         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id                 BIGINT       NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    course_id                  BIGINT       NOT NULL REFERENCES courses (id) ON DELETE RESTRICT,
    amount_cents               INTEGER      NOT NULL CHECK (amount_cents >= 0),
    commission_cents           INTEGER      NOT NULL CHECK (commission_cents >= 0),
    instructor_earnings_cents  INTEGER      NOT NULL CHECK (instructor_earnings_cents >= 0),
    currency                   VARCHAR(3)   NOT NULL,
    stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_payment_intent_id   VARCHAR(255),
    status                     VARCHAR(20)  NOT NULL CHECK (status IN ('PAID', 'REFUNDED')),
    created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_purchases_student_course ON purchases (student_id, course_id);

-- The entitlement itself — always written in the same transaction as its purchase.
CREATE TABLE enrollments (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id            BIGINT      NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    course_id             BIGINT      NOT NULL REFERENCES courses (id) ON DELETE RESTRICT,
    purchase_id           BIGINT      NOT NULL UNIQUE REFERENCES purchases (id) ON DELETE RESTRICT,
    progress_percent      INTEGER     NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    last_lesson_id        BIGINT      REFERENCES lessons (id) ON DELETE SET NULL,
    last_position_seconds INTEGER     NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id)
);

CREATE INDEX ix_enrollments_course ON enrollments (course_id);

-- seconds_watched is the furthest point ever reached (so rewinding never
-- undoes completion); enrollments.last_position_seconds is where to resume.
CREATE TABLE lesson_progress (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id      BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    lesson_id       BIGINT      NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
    seconds_watched INTEGER     NOT NULL DEFAULT 0 CHECK (seconds_watched >= 0),
    completed       BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_lesson_progress_student_lesson UNIQUE (student_id, lesson_id)
);

CREATE TABLE payouts (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instructor_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    amount_cents     INTEGER      NOT NULL CHECK (amount_cents > 0),
    currency         VARCHAR(3)   NOT NULL,
    stripe_payout_id VARCHAR(255) UNIQUE,
    -- Mirrors every status Stripe can report for a payout.
    status           VARCHAR(20)  NOT NULL
                         CHECK (status IN ('PENDING', 'IN_TRANSIT', 'PAID', 'FAILED', 'CANCELED')),
    requested_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_payouts_instructor ON payouts (instructor_id, requested_at DESC);

-- Only verified purchasers can review (purchase_id proves it), once per course.
CREATE TABLE reviews (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id  BIGINT      NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    course_id   BIGINT      NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    purchase_id BIGINT      NOT NULL REFERENCES purchases (id) ON DELETE RESTRICT,
    rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT        NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL CHECK (status IN ('VISIBLE', 'HIDDEN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_reviews_student_course UNIQUE (student_id, course_id)
);

CREATE INDEX ix_reviews_course_status ON reviews (course_id, status);

CREATE TABLE wishlist_items (
    student_id BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id  BIGINT      NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, course_id)
);

-- Deactivated rather than deleted, same "hide, don't destroy" rule as reviews.
CREATE TABLE announcements (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message    VARCHAR(500) NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Single-row table so an admin can change the rate without a redeploy.
CREATE TABLE platform_settings (
    id                      SMALLINT PRIMARY KEY CHECK (id = 1),
    commission_rate_percent INTEGER  NOT NULL CHECK (commission_rate_percent BETWEEN 0 AND 100)
);

INSERT INTO platform_settings (id, commission_rate_percent) VALUES (1, 20);
