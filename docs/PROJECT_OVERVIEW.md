# Zyncro ERP — Project Overview

Zyncro ERP is a single-page application backed by a REST API that runs the day-to-day
operations of an educational organization: admissions, learning operations, financials,
internal communications and certificate issuance. This document describes the system as
it exists after the October 2026 end-to-end audit and repair pass.

---

## 1. Technology stack (verified from the repository)

| Layer     | Technology |
| --------- | ---------- |
| Backend   | PHP 8.2+, Laravel 12, Sanctum (SPA cookie sessions), DomPDF, Endroid QR Code |
| Frontend  | React 19, Vite 7, Tailwind CSS 3, React Router 7, Axios, Recharts, Lucide, Framer Motion |
| Database  | MySQL 8 — `zyncro_erp` (main) + `zyncro_erp_payments` (payment ledger, separate connection) |
| Mail      | Laravel Mail over SMTP (local sink: Mailpit on `:1025`, UI on `:8025`) |
| Queue     | Database queue (`jobs`, `failed_jobs`) for bulk email |
| Tests     | PHPUnit 11 feature tests (`backend/tests/Feature/`) on an isolated sqlite database |

## 2. Architecture

```
            ┌─────────────────────┐
            │   React 19 SPA      │
            │   (Vite, Tailwind)  │
            └──────────┬──────────┘
                       │ axios + Sanctum cookie sessions (same-origin localhost)
                       ▼
            ┌─────────────────────┐
            │  Laravel 12 REST API │
            │  /api/* role gates   │
            └──┬────────────┬─────┘
               │            │
       ┌───────▼────┐  ┌────▼─────────┐
       │ zyncro_erp │  │ zyncro_erp_  │
       │  (main)    │  │ payments     │
       └────────────┘  └──────────────┘
```

- **Backend** — a stateless JSON API. Every authenticated route runs under Sanctum
  stateful middleware plus the `role:` and `approved` middleware gates. Controllers are
  grouped per role (`app/Http/Controllers/{Admin,Faculty,Student,Franchise,Employee,Attendance,User}`).
- **Frontend** — one SPA (`frontend/src`) with per-role route trees in `App.jsx`, a single
  navigation source of truth in `src/config/navigation.jsx`, and shared components
  (`AppModal`, `DataTable`, `States`, `StatusBadge`, `ToastProvider`, `ConfirmModal`).
- **Two isolated databases** — the `Payment` model binds to the `payments_db` connection
  explicitly; the main schema never assumes the payments table exists locally.

## 3. User roles

| Role      | Dashboard | Scope |
| --------- | --------- | ----- |
| Admin     | `/dashboard`   | Full ERP management — students, courses, exams, franchises, faculty, corporate, payments, communication, users, reports |
| Faculty   | `/faculty`     | Only assigned course/batch data — materials, classes, attendance, assignments, exams, results, certificates, payouts |
| Student   | `/student`     | Own data only — enrollment, learning, exams, assignments, results, certificates, fees |
| Franchise | `/franchise`   | Own franchise only — students stamped with `students.franchise_id`, enrollments, courses, faculty, revenue, commission |
| Employee  | `/employee`    | Own employment profile, certificates, company announcements, directory |

Server-side enforcement: `EnsureUserHasRole` (401/403), `EnsureUserIsApproved`
(blocks unapproved accounts from every dashboard API), plus ownership checks inside
every student/faculty/franchise controller.

## 4. Module map

**Admin**
- Student Management — Add Student (3-stage wizard), Manage Students, Enrollment
  Center (document verification → payment → approval), Digital ID cards, QR attendance.
- Course Management — Add/Manage courses + batches, Study materials (pdf/video/notes
  with access rules), Online classes (3-stage scheduling wizard with platform + access).
- Exam Management — Assignments, Schedule Exam (5-stage wizard), Manage Exams
  (postpone/cancel with time-based guards), Admit Cards, Publish Results,
  Issue Certificates (course-completion eligibility).
- Franchise / Faculty / Corporate management (roles, employees, corporate certificates,
  company announcements).
- Payments — payment hub, student fees, franchise payments + commission, faculty
  payouts, payment history.
- Communication — bulk email (queued per-recipient jobs), email logs, student
  communications with audience rules.
- User Access Control — create users, approve pending registrations, reset credentials.
- Reports — attendance matrix, payment analytics.

**Student** — enroll in courses, my learning (courses, materials, online classes, QR
attendance, digital ID card), examinations (exams, assignments, admit cards, results),
certificates, payments (make payment, upload proof, track fees, history), communication.

**Faculty** — teaching (courses, students), content (materials, classes, QR attendance),
assessment (assignments, exams, admit cards, results), certificates, announcements,
payouts, attendance reports.

**Franchise** — students, enrollments, courses, faculty, revenue, commission, revenue
analytics, announcements — strictly scoped to the franchise's own students.

**Employee** — employment profile, certificates, announcements, team directory,
account settings.

## 5. Core end-to-end workflows

1. **Admission & enrollment** — student self-enrolls (or admin creates) → enrollment
   `pending` → student uploads payment proof → admin verifies the proof → admin marks
   the fee paid (a row is written to the payments ledger) → admin approves → enrollment
   becomes `active` (or `cancelled`, which can be revived instead of duplicated).
2. **Teaching** — admin assigns faculty to course/batch pairs → faculty publishes
   materials/classes scoped to their batches → students see them via access rules.
3. **Assessment** — faculty/admin schedule exams (future) → admit cards generated for
   active enrollees only → exam time passes → results entered per student (transactional,
   enrollment-checked) → certificates minted per passed exam and issuable only when the
   student has no failed exam in that course/batch.
4. **Attendance** — staff starts a QR session (10-minute window, single active session
   per course/batch enforced in the schema) → student opens `/attendance` on mobile,
   receives an email OTP, scans the QR → attendance row written (`present`).
5. **Communication** — admin sends bulk email (queued, one job per recipient, retries)
   or publishes student communications scoped by audience rules; franchise users see the
   notices aimed at their students.
6. **Certificates & verification** — issued certificates get a non-sequential number and
   a public verification endpoint plus a public PDF (QR generated locally).

## 6. Authentication

Two-step login for every account: `login-check` (credentials) → `send-otp` (6-digit code,
bcrypt-hashed at rest, single-use, attempt-locked, cooldown + hourly caps) →
`verify-otp` → `login-complete`. The 2FA session flag is bound to the verified user id,
so a verification can never be replayed for a different account. Registration
(`register/start|verify|complete`) whitelists roles server-side and forces
`approve_status = false` until an admin approves. Password reset uses PII checks with a
per-account failure lockout plus an OTP.

## 7. Local development

```bash
# services (macOS/Homebrew)
brew services start mysql mailpit

# backend
cd backend
composer install
php artisan key:generate
php artisan migrate --seed     # seeders: 5 role accounts + demo data
php artisan serve --host=localhost --port=8000

# frontend
cd frontend
npm install
npm run dev                    # http://localhost:5173

# queue worker (bulk email)
cd backend && php artisan queue:work --tries=3
```

The five seeded test accounts share the `SEED_USER_PASSWORD` (default `Zyncro@2026`)
and are documented in the README. OTP emails land in Mailpit at
[http://localhost:8025](http://localhost:8025).

## 8. Directory guide

```
backend/
├── app/Http/Controllers/    # Admin/ Faculty/ Student/ Franchise/ Employee/ Attendance/ User/
├── app/Services/            # OtpService, EmailService, FacultyAssignmentService, QrCodeService
├── app/Jobs/                # SendBulkEmailJob
├── database/migrations/     # main + payments_db schema
├── database/seeders/        # TestUsersSeeder, DemoDataSeeder
├── tests/Feature/           # RBAC + business-logic regression tests
└── resources/views/         # Blade email + PDF templates

frontend/src/
├── pages/dashboard/         # admin modules
├── pages/student-dashboard/ # student portal
├── pages/faculty-dashboard/ # faculty portal (wraps shared admin components with apiPrefix="/faculty")
├── pages/franchise-dashboard/
├── pages/employee-dashboard/
├── components/common/       # AppModal, DataTable, States, StatusBadge, ToastProvider, ConfirmModal
├── config/navigation.jsx    # per-role navigation (single source of truth)
└── lib/                     # apiClient (CSRF + interceptors), auth guards, theme

docs/
├── screenshots/             # 190 captures organized by role → module → page/state
├── PROJECT_OVERVIEW.md      # this file
├── PROJECT_AUDIT.md         # audit findings and fixes
├── TESTING_REPORT.md        # executed verification
└── SCREENSHOT_COVERAGE.md   # screenshot ledger
```
