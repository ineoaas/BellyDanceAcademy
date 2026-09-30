# Belly Dance Academy

Online course marketplace for The Bellydance Company: instructors sell video
courses, students buy and watch them, admins moderate.

| Part | Stack |
| --- | --- |
| `backend/` | Java 21 · Spring Boot 4 · Spring Security · JPA/Hibernate · Flyway · PostgreSQL |
| `frontend/` | React 19 (JavaScript) · Vite · React Router · TanStack Query · Tailwind CSS 4 |
| Integrations | Stripe Connect (payments/payouts) · Mux (video) · Resend (email) |

## Running locally

Prerequisites: Java 21, Node 24+, Docker.

```bash
cp .env.example .env              # optional: add Stripe/Mux/Resend keys
docker compose up -d db           # PostgreSQL on :5432

cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev   # API on :8080
cd frontend && npm install && npm run dev                            # app on :3000
```

The `dev` profile seeds demo data:

| Role | Email | Password |
| --- | --- | --- |
| Student | student@example.com | student123 |
| Instructor | instructor@example.com | instructor123 |
| Admin | admin@example.com | admin123 |

Without a `RESEND_API_KEY`, emails (including password-reset links) are
printed to the backend log instead of being sent.

Full stack in containers: `docker compose --profile app up --build` → http://localhost:3000

API docs (OpenAPI/Swagger UI): http://localhost:8080/api/docs/ui

## Tests

```bash
cd backend && ./mvnw verify    # unit tests + API integration tests on real PostgreSQL (needs Docker)
cd frontend && npm test        # Vitest + Testing Library
cd frontend && npm run lint
```

## Architecture

```
Browser ──► React SPA ──/api──► Spring Boot API ──► PostgreSQL
                                   │
                                   ├─► Stripe (checkout, Connect payouts) ◄── webhook
                                   ├─► Mux (direct uploads, signed playback) ◄── webhook
                                   └─► Resend (email, sent after commit)
```

The SPA and API are served from **one origin** (Vite proxy in development,
nginx in production), so no CORS setup is needed and cookies stay first-party.

### Backend: a modular monolith

One package per feature. Each package owns its entities, repositories,
services, controllers and DTOs, and other modules use it only through its
public services.

| Package | Responsibility |
| --- | --- |
| `user` | Accounts, self-service profile, admin moderation |
| `auth` | Sessions, login/registration, password reset, security config |
| `instructor` | Instructor profiles, application review |
| `course` | Course aggregate, authoring, approval workflow |
| `lesson` | Lessons, ordering, video lifecycle (Mux webhook) |
| `learning` | Enrollments, progress tracking, gated playback |
| `commerce` | Checkout, commission, purchases (Stripe webhook), payouts |
| `review` · `wishlist` · `announcement` | As named |
| `catalog` | Public read model: listing and course pages, batch-composed |
| `notification` | Email templates and delivery, triggered by domain events |
| `video` | Mux API client, webhook verifier, playback token signer |

Key decisions:

- **Sessions:** opaque random token in an HttpOnly, SameSite=Lax cookie. Only
  the token's SHA-256 hash is stored, and suspended users are signed out on
  their next request.
- **CSRF:** double-submit token (`XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header).
  Webhooks are exempt because they're verified by signature.
- **Authorization happens on the server.** Each area is gated by role, and
  services check ownership. Another instructor's course returns 404, not 403,
  so course ids can't be probed.
- **Money is integer cents.** Commission is split with exact integer rounding
  and snapshotted on each purchase.
- **The payment webhook is the source of truth.** It's idempotent: redelivered
  events are no-ops, and the purchase and enrollment commit in one transaction.
- **Side effects run after commit.** Emails are sent after the transaction
  commits and off the request thread.
- **Schema:** Flyway migrations, real foreign keys and CHECK constraints.
  Hibernate only validates the schema; it never alters it.
- **Errors:** RFC 7807 `ProblemDetail` responses with a stable `code` and
  per-field `fieldErrors`.

### Frontend

```
src/
  app/          router (lazy route per page), providers, root layout, error boundary
  components/   ui/ (design system: Button, Field, Table, Panel, …) and layout/
  features/     auth · catalog · learning · instructors · student · studio · admin · marketing
                  each with api.js (HTTP calls), hooks.js (queries/mutations), pages/, components/
  lib/          http client (CSRF + ApiError), formatting, labels, safe redirects
```

- Server state lives in TanStack Query. There's no global client store.
- Route guards (`RequireRole`) only improve navigation; the API still enforces
  every rule.
- Catalog filters live in the URL, so filtered results are shareable.

## Webhooks (local)

```bash
stripe listen --forward-to localhost:8080/api/webhooks/stripe
# Mux: point the dashboard webhook (or a tunnel) at /api/webhooks/mux
```
