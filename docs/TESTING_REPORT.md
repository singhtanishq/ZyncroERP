# Zyncro ERP — Testing Report

This report lists the verification that was actually executed while preparing the
October 2026 audit/repair release. Nothing here is projected or assumed — each section
records the command, the environment, and the observed result.

---

## 1. Environment

| Component   | Value |
| ----------- | ----- |
| OS          | macOS (arm64), Apple Silicon |
| PHP         | 8.4.25 (CLI), Laravel 12 |
| Node        | v24.19.0, npm 11.17.0, Vite 7 |
| MySQL       | 9.6.0 (Homebrew) — `zyncro_erp` + `zyncro_erp_payments` |
| Mail        | Mailpit (SMTP `127.0.0.1:1025`, UI `:8025`) |
| Browser     | Google Chrome driven headless via Playwright (viewport 1440×900 @2x; mobile 390×844) |
| Seed users  | The five `TestUsersSeeder` accounts + `DemoDataSeeder` dataset |

## 2. Automated tests

**Command:** `php vendor/bin/phpunit` (backend)

```
OK (17 tests, 37 assertions)
```

| Suite | Coverage |
| ----- | -------- |
| `RoleAccessControlTest` (8 tests) | Every role's own APIs answer 200; every other role gets 403; unauthenticated never 200; unapproved accounts blocked; a faculty member with zero assignments sees zero students. |
| `EnrollmentPaymentLogicTest` (9 tests) | Approve only from `pending`; reject requires remarks and refuses completed enrollments; mark-paid requires a verified proof, refuses overpayment, and writes a payments-ledger row; fee updates are scoped per course and never rewrite sibling rows; certificate issuance is blocked while any exam in the course/batch is failed; admit cards require an active enrollment; results cannot be saved before the exam ends. |

Test-infrastructure work that this required (documented as part of the fix pass):

- `PAY_DB_DRIVER` override so the payments ledger runs on sqlite in tests
  (`phpunit.xml` + `config/database.php`), with a per-process ledger reset in
  `tests/TestCase.php`.
- The payments-ledger migration is idempotent (`hasTable` guard) because the ledger
  connection is never reset by `migrate:fresh`.
- Migrations made driver-portable where they used MySQL-only SQL
  (`student_document` unique constraints, faculty status drop).

## 3. Static and build checks

| Check | Command | Result |
| ----- | ------- | ------ |
| Frontend production build | `npm run build` (frontend) | ✅ passes — 2964 modules, no type/transform errors |
| Backend syntax | `php -l` over every modified file (40+ files) | ✅ no syntax errors |
| Route registration | `php artisan route:list` | ✅ all new routes present (`/api/qr`, `/api/admit-card/token/{token}/pdf`, `/api/student/assignments/{id}/attachment`, `/api/assignments/submissions/file/{path}`) |
| Migrations | `php artisan migrate` (MySQL, real dev DB) | ✅ 5 new migrations applied cleanly |

## 4. Browser end-to-end verification (manual, scripted via Playwright)

Every flow below was executed in the real browser against the running app, and the
resulting database state was verified with SQL afterwards. Screenshots for each step
live in `docs/screenshots/` (paths in `SCREENSHOT_COVERAGE.md`).

### 4.1 Authentication (all roles)

- Login (`login-check` → `send-otp` → `verify-otp` → `login-complete`) exercised for
  **all five roles** via the real UI and via the API; OTPs read from Mailpit.
- 2FA binding verified: a login started for account A cannot be completed with a
  verification performed for account B (code-reviewed + covered by the session-flag
  binding; the attack path is closed in `PendingLoginController`).
- Registration: signup → signup OTP → identity lock after verification → info stage →
  password stage → success → **pending approval screen** → admin approves in
  User Access Control → account works. (Dev Patel test account.)
- Forgot-password flow entered and progressed to the security-questions stage.
- Credential reset: admin "Reset Login" for a student → new password arrives by email →
  login with the new password works.

### 4.2 Admin

- Dashboard renders live stats; error state verified by forcing a failure path in code review.
- Add Student 3-stage wizard → student + login + enrollment + fee row created
  (verified in `users`, `students`, `student_enrollments`, `student_fees`).
- Enrollment Center: proof uploaded by the student → verified → ₹24,000 marked paid →
  approved. **Verified in SQL:** enrollment `active`/`paid`, fee `24000/paid`, and a
  ledger row `ENR-10-…, offline, success` in `zyncro_erp_payments.payments`.
- ID cards: activation (the previously-500ing endpoint), list state changes, public PDF
  preview (now `/api/id-card/{token}/view`).
- Attendance: session start → live QR modal (locally generated QR) → validation error
  state captured → session expired correctly.
- Courses: add/manage pages, batch expansion, edit modals.
- Study materials: PDF material created through the modal with a real file upload
  (file present under `storage/app/private/study-materials/`).
- Online classes: full 3-step wizard → class `scheduled`, visible to enrolled students.
- Exams: two exams scheduled through the 5-step wizard (upcoming + past-for-results);
  results published via the expand → enter scores → save flow (results + passed/failed
  certificate rows appear; the failed student's certificate is blocked from issuance in
  the UI — matches the new eligibility rule); admit cards generated only for the
  upcoming exam's enrolled students; PDF preview works via the token route.
- Assignments: created; submission file uploaded by a student and visible in the
  admin/faculty submissions modal (shared file route).
- Payments: all five payment pages; fee row expansion; ledger growth visible.
- Communication: bulk-email compose modal; student communications published with
  audience rules; email logs.
- Users: add/manage/pending; approval of the registered test account.
- Reports: attendance matrix (shows the marked attendance), payment analytics.
- Dark mode verified on the dashboard and student list; mobile viewport (390×844) verified.

### 4.3 Student

- Dashboard (active + pending enrollment states), enroll-course catalog.
- My Learning: courses (detail modal), study materials, online classes (detail modal),
  digital ID card (+ public PDF), QR attendance page with live-session polling.
- Examinations: exams list + detail modal, assignment submission (file uploaded →
  persisted in `assignment_submissions`), admit cards (+ PDF), results by enrollment,
  certificates.
- Payments: upload payment proof (real PDF, `pending` verification in
  `student_documents`), track fees, make payment, payment history.
- Communication: audience rendering incl. "All Courses/All Batches" pills; view modal.

### 4.4 Faculty

- Dashboard with personalized greeting and per-assignment KPIs.
- My courses / my students (view modal).
- Content: materials, classes, QR attendance (faculty-scoped wrappers).
- Assessment: assignments (+ submissions modal with the student's file), schedule exam,
  manage exams, admit cards, results.
- Certificates, announcements, payouts, attendance reports, profile.

### 4.5 Franchise

- Dashboard populated after the franchise-assignment fix (5 students, 3 active
  enrollments, collected fees ₹72,000, commission estimate).
- Students, enrollments, courses, student reports, faculty, announcements, revenue,
  commission, revenue analytics — all scoped to the franchise's own data.

### 4.6 Employee

- Home, employment profile, certificates, announcements, team directory, account settings.

### 4.7 Attendance end-to-end (API-driven where a camera is required)

- Admin started a QR session (single-active constraint enforced by the new unique index).
- Student requested the attendance OTP by email, verified it, and marked attendance with
  the session's QR token.
- **Verified in SQL:** `attendances` row `(session 5, student 1, present)`.

## 5. Known gaps in verification

- The QR **camera scan** itself was not exercised (headless browser has no camera); the
  scan → token → mark path was verified at the API level, and the mobile UI states are
  documented via screenshots.
- Bulk email delivery was not waited on inside a browser session; the queued-job path is
  unchanged from the audited implementation and logs to `email_logs`.
- Public certificate verification + PDF were exercised over HTTP (status 200 responses
  with the issued certificate number) but not screenshotted in a logged-out browser tab.
- Performance/load testing and accessibility auditing were out of scope for this pass.
