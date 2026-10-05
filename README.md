# Zyncro ERP

> A production-minded school/academy ERP for the management of students, faculty, franchises and corporate employees. Built with **Laravel 12** (REST API) and **React 19 + Vite 7** (SPA), covering the complete lifecycle from admissions through certificates, with role-scoped dashboards, secure two-step authentication and an internal payment management system.

Zyncro ERP stands on its own. The repository is the product, not a migration history.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Product Purpose](#2-product-purpose)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [Architecture](#5-architecture)
6. [Authentication](#6-authentication)
7. [Authorization](#7-authorization)
8. [Email System](#8-email-system)
9. [Payment Management](#9-payment-management)
10. [Queue System](#10-queue-system)
11. [Role Overview](#11-role-overview)
12. [Admin Dashboard](#12-admin-dashboard)
13. [Faculty Dashboard](#13-faculty-dashboard)
14. [Student Dashboard](#14-student-dashboard)
15. [Franchise Dashboard](#15-franchise-dashboard)
16. [Employee Dashboard](#16-employee-dashboard)
17. [Search / Filter / Pagination](#17-search--filter--pagination)
18. [Responsive Design](#18-responsive-design)
19. [Dark Mode](#19-dark-mode)
20. [UI/UX System](#20-uiux-system)
21. [Database Setup](#21-database-setup)
22. [Environment Configuration](#22-environment-configuration)
23. [Migration & Seeder Setup](#23-migration--seeder-setup)
24. [Local Development](#24-local-development)
25. [Testing](#25-testing)
26. [Security Considerations](#26-security-considerations)
27. [Project Structure](#27-project-structure)
28. [Troubleshooting](#28-troubleshooting)
29. [Future Extensibility](#29-future-extensibility)

---

## 1. Project Overview

Zyncro ERP is a single, coherent application that unifies the day-to-day operations of an educational organization:

- **Admissions** through course enrollment with email-OTP verification.
- **Learning operations** — study materials, online classes, attendance via QR, assignments, exams, admit cards, results.
- **People management** for five distinct user types with completely separated data scopes.
- **Financial operations** — fee management, franchise revenue, faculty payouts — fully internal, no external gateway.
- **Internal communications** — admin broadcasts, scoped student notices, queued bulk email.
- **Certificate management** for both students and corporate employees, with public verification.

## 2. Product Purpose

A real academy or school that has grown past spreadsheets and needs a single system to:

- Manage 1,000s of students, 100s of faculty, multiple franchise partners, and an in-house team.
- Run the academic lifecycle (enroll → teach → assess → certify) without copy-pasting data between systems.
- Track money owed, money received, and money owed-to (franchise / faculty / employee) on a single ledger.
- Authenticate every user with a one-time code sent to a real inbox.
- Issue verifiable certificates that any employer can confirm via a public URL.

## 3. Key Features

- **Five first-class roles** — admin, faculty, student, franchise, employee — each with a distinct dashboard, navigation, and data scope.
- **Two-step authentication** (password + email OTP) for every login, with rate limiting, attempt lockout and single-use codes.
- **Server-side role-based authorization** on every protected route group.
- **Internal payment management** with a separate local MySQL ledger; no external gateway, no redirects.
- **Email infrastructure** built on Laravel Mail with provider-agnostic SMTP transport; local development uses Mailpit.
- **Queued bulk email** with retries, backoff and a `failed_jobs` trail.
- **Search, filter and paginate** on every list, server-side for large datasets.
- **Unified design system** in teal (`#159690`) and deep blue (`#154B87`); light mode default, dark mode everywhere.
- **Reusable modal system** (`AppModal`) with centered positioning, internal scrolling, and a mobile sheet layout.
- **Toast notifications** (`ToastProvider`) for every successful/failed action.
- **Responsive** down to 375px (mobile), with a real drawer navigation.

## 4. Technology Stack

| Layer     | Technology                                                                        |
| --------- | --------------------------------------------------------------------------------- |
| Backend   | PHP 8.2+, Laravel 12, Sanctum (SPA cookie sessions), DomPDF, Bacon QR codes, Spatie Laravel Permission (installed, available for future use) |
| Frontend  | React 19, Vite 7, Tailwind CSS 3, React Router 7, Axios, Recharts, Lucide icons, Framer Motion |
| Database  | MySQL 8 — `zyncro_erp` (main) + `zyncro_erp_payments` (payment ledger)            |
| Mail      | Laravel Mail (SMTP transport; local sink = Mailpit)                                |
| Queue     | Database queue (bulk email jobs)                                                   |

## 5. Architecture

```
            ┌─────────────────────┐
            │   React 19 SPA       │
            │  (Vite, Tailwind)    │
            └──────────┬──────────┘
                       │ axios + Sanctum
                       │ cookie sessions
                       ▼
            ┌─────────────────────┐
            │  Laravel 12 REST API │
            │  /api/* role gates   │
            └──┬───────────┬──────┘
               │           │
       ┌───────▼──┐   ┌────▼────────┐
       │  zyncro_ │   │  zyncro_   │
       │   _erp   │   │_erp_payments│
       └──────────┘   └─────────────┘
       (main ERP)     (payment ledger)
```

- **Backend** is a stateless JSON API. Every authenticated route uses the same Sanctum cookie session.
- **Frontend** is a single SPA with role-based routing.
- **The two databases** are isolated. The main app never assumes a `payments` table exists in the same connection; a `Payment` model binds to the `payments_db` connection explicitly.

## 6. Authentication

**Two-step login flow:**

1. `POST /api/login-check` — email + password, validated against `users` (rate limited per IP+email).
2. `POST /api/send-otp` — a 6-digit numeric code is generated, hashed, and emailed through the configured SMTP transport (rate limited per email).
3. `POST /api/verify-otp` — verifies the code, marks the session flag `two_factor_verified` (consumed).
4. `POST /api/login-complete` — refuses to log the user in unless `two_factor_verified` is set.

**OTP hardening:**

- Old codes are invalidated whenever a new one is issued.
- 6-digit codes, hashed (never stored plaintext).
- Single-use; locked after `OTP_MAX_ATTEMPTS` wrong guesses (default 5).
- Per-email cooldown (`OTP_RESEND_COOLDOWN_SECONDS`, default 60) and hourly request cap (`OTP_MAX_REQUESTS_PER_HOUR`, default 10).
- Routes `send-otp`, `verify-otp`, `login-check`, `login-complete`, `register/*`, `password/*` and `attendance/*` are throttled via Laravel's `throttle:` middleware.

**CSRF protection:**

- The SPA's `apiClient` fetches the XSRF cookie before any authenticated write and **re-fetches it after login/logout** — Laravel rotates the session token, so caching the cookie across the auth boundary was the original 419 source.
- A 419 from the server triggers one automatic refresh-and-retry of the request.
- The login page is intentionally on the same host as the API (`localhost`) so session cookies match.

**Local development OTP testing:**

- Default `MAIL_MAILER=smtp` with `MAIL_HOST=127.0.0.1` and `MAIL_PORT=1025` points at **Mailpit**, a local SMTP sink.
- Every email the app sends is accepted by Mailpit and viewable at `http://localhost:8025` — the full transport chain is exercised.

## 7. Authorization

- **Server-side role middleware** (`role:admin` / `role:student` / etc.) gates every protected route group.
- **Approval middleware** (`approved`) blocks unapproved accounts from accessing the dashboards (admin is exempt).
- **Ownership checks** in controllers ensure a student can only see their own data, a faculty only sees assigned course/batch data, and a franchise only sees their own students, faculty and revenue.
- **Resource-level access** in the `franchise` dashboard uses the same `course/batch access rules` model that student communications use, so the data scoping is consistent.
- Frontend route guards (`RoleRoute`) mirror the backend — clicking into a route you don't have permission for redirects to your own dashboard, but the backend still has the final say.

## 8. Email System

### Architecture

- Provider-agnostic. The application code does not import any provider SDK. Transport is chosen by `MAIL_MAILER` (`log`, `smtp`, `sendmail`, etc.).
- Mailable classes in `app/Mail/`: `OtpMail`, `StudentCredentialsMail`, `UserCredentialsMail`, `AnnouncementMail`.
- Blade templates in `backend/resources/views/emails/`: a shared layout + three transactional templates, all with Zyncro branding, dark-mode support and clear hierarchy.
- The `EmailService` façade exposes intent-named methods: `otp()`, `studentCredentials()`, `userCredentials()`, `announcement()`. Application code calls intent, never a transport-specific sender.

### Emails sent

| Type                | Trigger                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| Login OTP           | every `login-check` when credentials valid                                              |
| Signup OTP          | `register/start`                                                                       |
| Password-reset OTP  | `password/forgot-security` (after identity check)                                      |
| Profile change OTP  | `user/send-otp` (for password change)                                                  |
| Attendance OTP      | `attendance/send-otp` (mobile attendance flow)                                          |
| Student credentials | admin creates a student / resets their login                                            |
| Staff credentials   | admin creates any non-student user / resets login                                       |
| Bulk announcements  | `AdminCommunicationController::send` queues one job per recipient                        |

### Rate limits

OTP issuance is protected by **two layers**: the route-level `throttle:30,1` middleware and the per-email `OtpService` cooldown / hourly cap. Tune `OTP_*` in `.env`.

### Failure visibility

If delivery fails, the `EmailService` logs a structured `Log::error` entry and returns `['ok' => false, 'error' => '…']`. The caller shows a user-safe error — never a stack trace.

## 9. Payment Management

**No external gateway. The internal ERP is the payment system.**

- Two databases: `zyncro_erp` (main) + `zyncro_erp_payments` (ledger).
- The `Payment` model binds to `payments_db` via `protected $connection = 'payments_db'`.
- The `payments` table is provisioned by a normal Laravel migration (`create_payments_table_in_payments_db`).
- `.env.example` shows local development values (`PAY_DB_HOST=127.0.0.1`, `PAY_DB_DATABASE=zyncro_erp_payments`).

**Workflow:**

```
Enrollment → student uploads payment proof → admin verifies → admin marks paid
```

- A `StudentFee` record tracks `total_fees` / `paid_fees` / `status` per (student, course, batch).
- An admin can mark a fee paid via `AdminStudentFeeController::update` and `EnrollmentPaymentController::markPaid`.
- Franchise revenue and commission are recorded in `franchise_payments` and `franchise_commissions`.
- Faculty salary payouts are recorded in `faculty_salary_records`.

**Public certificate PDFs** (`/api/corporate-certificate/{certificateNumber}/view`) are resolved by the **non-sequential certificate number** rather than the database id, to prevent IDOR enumeration.

## 10. Queue System

- `QUEUE_CONNECTION=database` (jobs/failed_jobs tables already in the initial migration).
- The bulk-email job (`SendBulkEmailJob`) is dispatched **one job per recipient**.
- The job:
  - Loads the recipient user.
  - Sends the announcement through `Mail::to()`.
  - Records the outcome in `email_logs` (`status = true|false`).
  - Has `$tries = 3` and `$backoff = [30, 120]` seconds.
  - Has a `failed(Throwable)` handler that records the failure in `email_logs` after all retries are exhausted.
- For local development: `php artisan queue:work --tries=3` runs the worker.

## 11. Role Overview

| Role      | Dashboard route    | What they see                                                                       |
| --------- | ------------------ | ---------------------------------------------------------------------------------- |
| Admin     | `/dashboard`         | Full ERP management: students, courses, exams, franchises, faculty, corporate, payments, communication, user access, reports |
| Faculty   | `/faculty`           | Assigned course/batch teaching: materials, classes, attendance, assignments, exams, results, certificates, payouts, reports |
| Student   | `/student`           | Enrollment, learning materials, online classes, QR attendance, ID card, exams, assignments, results, certificates, fees, announcements |
| Franchise | `/franchise`         | Own students, enrollments, courses, faculty, revenue, commission, announcements — strictly scoped to the franchise |
| Employee  | `/employee`          | Employment profile, certificates, company announcements, team directory, account |

## 12. Admin Dashboard

The admin has the most modules:

- **Student Management** — add, manage, enrollment center, digital ID cards, QR attendance sessions.
- **Course Management** — add, manage, study materials, online classes.
- **Exam Management** — assignments, schedule, manage, admit cards, results, certificate issue.
- **Franchise Management** — add (with optional owner login), view/manage.
- **Faculty Management** — add (with optional franchise assignment), manage, course/batch assignment.
- **Corporate Management** — roles, employees (with optional employee login), certificates, **company announcements**.
- **Payments Management** — internal payment hub (no external portal), per-course student fees, franchise payments, faculty payouts, payment history.
- **Communication & Alerts** — bulk email send (queued), email logs, student communications.
- **User Access Control** — add, manage, approve pending users.
- **Reports & Analytics** — attendance, payments.

## 13. Faculty Dashboard

Faculty see only what they are assigned to:

- **Teaching** — their courses, their students.
- **Content** — materials, online classes, QR attendance for their courses.
- **Assessment** — assignments, schedule/manage exams, admit cards, results.
- **Certificates** — issue certificates.
- **Communication** — announcements for their assignments.
- **Finance** — their own monthly payouts (per-course salary records), with paid/unpaid history.
- **Reports** — attendance reports for their courses.

## 14. Student Dashboard

The student lifecycle is fully covered:

- **My Learning** — enrolled courses, study materials, online classes, QR attendance, digital ID card.
- **Examinations** — exams, assignments, admit cards, results.
- **Certificates** — earned certificates, with public download links.
- **Payments** — make payment (submit proof), upload payment proof, track course fees, payment history.
- **Communication** — student communications (matched by enrollment / course access).

## 15. Franchise Dashboard

The franchise is a real role with a real scope:

- **Students** — their own student list (search/paginate/filter), enrollment reports.
- **Enrollments** — every course enrollment from their students, with status and payment status.
- **Courses** — courses their students are enrolled in, with their own enrollment and fee-collection figures.
- **Faculty** — faculty members belonging to the franchise.
- **Revenue** — recorded revenue from the administration.
- **Commission** — the commission rate and the current estimated commission (rate × collected fees).
- **Analytics** — 12-month revenue report with bar chart.
- **Announcements** — student communications whose audience includes the franchise's students.

A franchise user **cannot** access global admin data, other franchise data, or admin endpoints. Every backend query is scoped through the authenticated user's own `Franchise` row.

## 16. Employee Dashboard

The employee dashboard is a first-class role:

- **Employment Profile** — corporate role, department, joining date, work email, phone, status.
- **Certificates** — issued corporate certificates with view/download links.
- **Announcements** — company-wide notices published by the administration.
- **Team Directory** — active colleagues (search by name, role, department, ID).
- **Account Settings** — profile + security (delegated to the shared `ManageProfile` page).

## 17. Search / Filter / Pagination

- **Server-side search** for `franchise/students`, `franchise/enrollments`, `franchise/faculty`, `employee/directory` and the admin tables.
- **Client-side filter chips** on status fields (Pending/Active/Completed/All).
- **Server-side pagination** via Laravel's `paginate()` with `current_page`, `per_page`, `total`, `last_page` metadata. The shared `DataTable` renders 1-of-N + prev/next controls.
- **Debounced search** (~350ms) to avoid spamming the API.

## 18. Responsive Design

- Sidebar collapses to a drawer on `<lg`; topbar exposes a hamburger.
- Tables become horizontally scrollable with `zx-scroll` for a slim, brand-themed scrollbar.
- Modals become a bottom-sheet on `<sm` while remaining centered on `>=sm`.
- Forms collapse from 2-column to 1-column; inputs grow full-width.
- Login page is single-column on `<lg`.
- Tested at 320 / 375 / 390 / 768 / 1024 / 1440 widths.

## 19. Dark Mode

- **Light mode is the default**; user preference is persisted to `localStorage` (`zyncro-theme`).
- Dark mode is a real design: surface tokens map to slate-900/800/700, hover states stay within the dark palette (no white-on-white flashes), shadows flatten, inputs/placeholders/headers are readable.
- Trigger: topbar moon/sun icon.

## 20. UI/UX System

- **Brand colors**: teal `#159690` (primary), deep blue `#154B87` (deep). Aliased in Tailwind as `brand-teal-{50..900}` and `brand-blue-{50..900}`.
- **Surfaces**: `--zx-bg`, `--zx-surface`, `--zx-surface-hover`, `--zx-border`, `--zx-text`, `--zx-text-muted`. Each in light + dark.
- **Typography**: system stack, no legacy fonts.
- **Spacing / hierarchy**: 2 / 4 / 6 / 8 grid; cards use consistent padding; page headers use 1.5rem (h1) + 0.875rem (subtitle).
- **Components**: `AppModal`, `DataTable`, `StatusBadge`, `States` (loading/empty/error), `ThemeToggle`, `ToastProvider`, `BrandLogo`, `Sidebar`, `Topbar`.
- **Icons**: Lucide (consistent stroke + size).
- **Motion**: Framer Motion on critical interactions (sidebar collapse, modal); subtle and quick.

## 21. Database Setup

```sql
CREATE DATABASE zyncro_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE zyncro_erp_payments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`backend/database/migrations/` includes the schema for both databases, including a migration that creates `payments` on the `payments_db` connection.

## 22. Environment Configuration

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zyncro_erp
DB_USERNAME=
DB_PASSWORD=

PAY_DB_HOST=127.0.0.1
PAY_DB_PORT=3306
PAY_DB_DATABASE=zyncro_erp_payments
PAY_DB_USERNAME=
PAY_DB_PASSWORD=

# Mail — local dev: Mailpit on :1025
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="no-reply@zyncro.test"
MAIL_FROM_NAME="Zyncro ERP"
MAIL_SUPPORT_EMAIL="no-reply@localhost"

# OTP
OTP_EXPIRATION_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
OTP_MAX_REQUESTS_PER_HOUR=10

# Session / Sanctum
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000
CORS_ALLOWED_ORIGINS=   # extra origins beyond the local Vite dev servers

# Seed / auth
SEED_USER_PASSWORD=Zyncro@2026  # shared password for the 5 mandatory local test users

# Operational
MIGRATION_SECRET=               # required to use /secure-migrate or /clear-cache
```

`frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000  # used only for absolute PDF/id-card links
```

**Never put backend secrets into `VITE_*` variables** — they are bundled into the browser.

## 23. Migration & Seeder Setup

```bash
cd backend
php artisan migrate          # runs the main schema
php artisan db:seed          # creates the 5 mandatory users + demo data
```

The seeders:

- `TestUsersSeeder` — creates the 5 mandatory local test accounts (Admin / Faculty / Student / Franchise / Employee). Password is read from `SEED_USER_PASSWORD` and never hardcoded in source.
- `DemoDataSeeder` — courses, batches, enrollments, fee records, 8 demo students, 1 demo faculty, franchise revenue, payment ledger, and 4 company announcements.

Dummy users use `@example.com` addresses (not real mailboxes). The 5 mandatory accounts use the addresses below so login can be verified end-to-end; they share the configured `SEED_USER_PASSWORD` and are intended for local testing only.

| Role      | Email                          |
| --------- | ------------------------------ |
| Admin     | contact@tanishqsingh.in        |
| Faculty   | tanishqsingh@outlook.in        |
| Student   | tanishq@iiitmanipur.ac.in      |
| Franchise | tanishqsingh.in@gmail.com      |
| Employee  | tanishq.cred@gmail.com         |

## 24. Local Development

```bash
# 1. Mailpit (SMTP sink)
brew install mailpit
mailpit --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025

# 2. Backend
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=localhost --port=8000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Sign in at `http://localhost:5173/login` with one of the local test users. The OTP email appears at `http://localhost:8025`.

## 25. Testing

What is verified end-to-end in this build:

- **Migration lifecycle** — `migrate:fresh` + `db:seed` produces a clean local database.
- **RBAC matrix** — every role's own APIs return 200, every other role returns 403.
- **Auth cycle** — full login/logout round-trips through the real SMTP transport (Mailpit) and authenticates correctly. 419 / 401 / 405 errors do not occur.
- **OTP policies** — per-email cooldown, hourly cap, code invalidation, attempt lockout, single-use, expiry all enforced.
- **Payment database isolation** — the historical real-database credentials are gone; the local `zyncro_erp_payments` is used.
- **Frontend build** — `npm run build` passes; no console errors on key pages; no critical `console.log` / `dd()` in production code.

## 26. Security Considerations

- **No secrets in frontend** — `VITE_*` is the only frontend env namespace and contains no secrets.
- **No legacy secrets in git** — `.env` is ignored; `.env.example` is the only env committed, with safe defaults.
- **No plaintext OTPs in production logs** — the only place OTPs are visible is the local `storage/logs/laravel.log` when the mailer is `log` (or in the Mailpit inbox when using `smtp`). The codebase never logs an OTP in `info` level.
- **Strong password hashing** — `Hash::make()` (bcrypt, configurable rounds via `BCRYPT_ROUNDS`).
- **Mass-assignment guarded** — every form request validates and explicitly lists allowed fields.
- **Ownership checks** in controllers prevent student A from reading student B's data, even with a guessed ID.
- **CORS** is explicit (`config('cors.allowed_origins')`); no wildcard credentials.
- **Cascade deletes** are limited; destructive controller endpoints are permission-checked.
- **Rate limits** on login, OTP, registration, password reset, bulk email, and attendance.
- **CSRF protection** is fully wired: cookie fetch on first auth, refresh after login/logout, and a single automatic retry on 419.

## 27. Project Structure

```
backend/
├── app/
│   ├── Http/Controllers/{Admin,Faculty,Student,Franchise,Employee,Attendance,User}
│   ├── Http/Middleware/        # role + approved gates
│   ├── Mail/                   # Mailables (provider-independent)
│   ├── Jobs/                   # SendBulkEmailJob (queued, retried, failed() logged)
│   ├── Models/                 # domain models with relations
│   └── Services/               # EmailService, OtpService, Faculty scoping service
├── config/
├── database/
│   ├── migrations/             # main + payments_db schemas
│   ├── seeders/                # TestUsersSeeder, DemoDataSeeder
│   └── factories/
├── resources/views/emails/     # Blade email templates (otp, student-credentials, user-credentials)
├── resources/views/pdf/        # certificate / ID card / admit card PDFs
└── routes/
    ├── api.php                 # all API routes (role-gated groups)
    ├── web.php
    └── console.php

frontend/
├── public/
│   └── assets/logos/           # logo_color.png (light), logo_lite.png (dark)
├── src/
│   ├── components/
│   │   ├── common/             # AppModal, DataTable, StatusBadge, States, ToastProvider, BrandLogo, ThemeToggle
│   │   └── layout/             # DashboardSidebar, DashboardTopbar
│   ├── config/navigation.jsx   # per-role nav (single source of truth)
│   ├── lib/
│   │   ├── auth/               # AuthProvider, useAuth, RoleBasedRoute, RoleRoute guards
│   │   ├── api/apiClient.js     # axios + CSRF + 401/419 interceptors
│   │   └── theme/              # ThemeProvider (light default + persisted)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── dashboard/          # admin
│   │   ├── faculty-dashboard/
│   │   ├── student-dashboard/
│   │   ├── franchise-dashboard/
│   │   └── employee-dashboard/
│   ├── tailwind.config.js      # brand tokens + legacy palette aliases
│   └── index.css               # light/dark surface tokens + hover/select safety net
└── package.json

docs/
└── screenshots/                # captured from the running app
    ├── authentication/
    ├── admin/ faculty/ student/ franchise/ employee/
    └── shared/

mailTemplates/                 # untracked; legacy HTML email designs
```

## 28. Troubleshooting

| Symptom                                                                 | Cause / fix                                                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Login fails with "CSRF token mismatch"                                  | The browser cached an old XSRF cookie; the `apiClient` re-fetches per auth write. Hard refresh if persistent. |
| OTP email not arriving                                                | Confirm Mailpit is running and `MAIL_HOST=127.0.0.1`, `MAIL_PORT=1025`. Open `http://localhost:8025`. |
| "Too many OTP requests"                                               | The per-email cooldown (60s) and hourly cap (10) are intentional. Wait or tune in `.env`.      |
| `migrate:fresh` drops `payments` but the migration fails              | Re-create `zyncro_erp_payments` with `mysql -e 'CREATE DATABASE...'` then run `php artisan migrate`. |
| Browser shows "Unauthenticated" on /api/user after a long session     | The 401 interceptor in `apiClient` redirects to `/login`. Log in again.                          |
| Background mailer not delivering                                     | Run a worker: `php artisan queue:work --tries=3`.                                                |
| Dark mode looks broken on a legacy page                               | Make sure the page uses the token system (`bg-[rgb(var(--zx-surface))]`). Legacy hardcoded `bg-slate-*` is auto-corrected by the CSS safety net. |

## 29. Future Extensibility

The codebase is structured so the following extensions are localized and safe:

- **New role** — add a value to the `role` enum constraint, add a `RoleRoute` in `App.jsx`, add a module list in `config/navigation.jsx`, add a dashboard page.
- **New email template** — add a Blade view under `resources/views/emails/`, add a Mailable in `app/Mail/`, add a method to `EmailService`.
- **New payment gateway** — the `Payment` model is connection-bound; the front-end uses `/api/*`; a real gateway can sit behind a controller that writes to `StudentFee` / `Enrollment`.
- **MFA expansion** — `two_factor_verified` is the only session flag; the OTP infrastructure already supports TOTP-style codes if extended.
- **Real-time updates** — add Laravel Echo + Reverb; every existing controller emits standard JSON responses that a broadcasting layer can mirror.
