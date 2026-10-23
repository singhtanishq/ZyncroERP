# Zyncro ERP

A production-minded school/academy ERP for the management of students, faculty, franchises
and corporate employees. Built with **Laravel 12** (REST API) and **React 19 + Vite 7**
(SPA), covering the complete lifecycle from admissions through certificates, with
role-scoped dashboards, mandatory two-step authentication and an internal payment ledger.

> **This README is a guided tour of the real application.** Every screenshot below was
> captured from the running system after the October 2026 end-to-end audit and repair
> pass (see [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md)). Use the table of contents to
> explore any role's dashboard, modules, workflows and dialogs.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Authentication & Security](#5-authentication--security)
6. [Payments & Communication](#6-payments--communication)
7. [Visual Application Tour](#7-visual-application-tour)
   - [Shared — Authentication](#shared--authentication)
   - [Shared — Theme & Responsive Shell](#shared--theme--responsive-shell)
   - [Public — Mobile QR Attendance](#public--mobile-qr-attendance)
   - [Admin — Dashboard](#admin--dashboard)
   - [Admin — Student Management](#admin--student-management)
   - [Admin — Attendance](#admin--attendance)
   - [Admin — Course Management](#admin--course-management)
   - [Admin — Exam Management](#admin--exam-management)
   - [Admin — Franchise Management](#admin--franchise-management)
   - [Admin — Faculty Management](#admin--faculty-management)
   - [Admin — Corporate Management](#admin--corporate-management)
   - [Admin — Payments](#admin--payments)
   - [Admin — Communication & Alerts](#admin--communication--alerts)
   - [Admin — User Access Control](#admin--user-access-control)
   - [Admin — Reports & Profile](#admin--reports--profile)
   - [Student — Dashboard & Enrollment](#student--dashboard--enrollment)
   - [Student — My Learning](#student--my-learning)
   - [Student — Examinations](#student--examinations)
   - [Student — Certificates](#student--certificates)
   - [Student — Payments](#student--payments)
   - [Student — Communication & Profile](#student--communication--profile)
   - [Faculty — Dashboard & Teaching](#faculty--dashboard--teaching)
   - [Faculty — Content](#faculty--content)
   - [Faculty — Assessment](#faculty--assessment)
   - [Faculty — Certificates, Communication, Finance & Reports](#faculty--certificates-communication-finance--reports)
   - [Franchise — Full Portal](#franchise--full-portal)
   - [Employee — Full Portal](#employee--full-portal)
8. [Local Development](#8-local-development)
9. [Database & Seeders](#9-database--seeders)
10. [Testing & Quality Assurance](#10-testing--quality-assurance)
11. [Project Structure](#11-project-structure)
12. [Known Limitations](#12-known-limitations)
13. [Documentation Index](#13-documentation-index)

---

## 1. Project Overview

Zyncro ERP unifies the day-to-day operations of an educational organization:

- **Admissions & enrollment** — student self-enrollment or admin-created enrollments with
  an admin-verified payment-proof workflow.
- **Learning operations** — study materials, online classes, QR attendance, assignments,
  exams, admit cards, results and certificates.
- **People management** — five distinct roles with server-enforced, completely separated
  data scopes.
- **Financial operations** — an internal payment ledger (separate database), student fee
  tracking, franchise revenue/commission and faculty payouts. No external gateway.
- **Internal communications** — queued bulk email, email logs and audience-scoped student
  notices.
- **Certificates** — verifiable student and corporate certificates with public URLs and
  locally generated QR codes.

## 2. Technology Stack

| Layer     | Technology |
| --------- | ---------- |
| Backend   | PHP 8.2+, Laravel 12, Sanctum (SPA cookie sessions), DomPDF, Endroid QR Code |
| Frontend  | React 19, Vite 7, Tailwind CSS 3, React Router 7, Axios, Recharts, Lucide, Framer Motion |
| Database  | MySQL 8 — `zyncro_erp` (main) + `zyncro_erp_payments` (isolated payment ledger) |
| Mail      | Laravel Mail (SMTP; local sink: Mailpit) |
| Queue     | Database queue (one job per bulk-email recipient, retries + failure log) |
| Tests     | PHPUnit 11 feature tests (RBAC + business logic) on an isolated sqlite database |

## 3. Architecture

```
            ┌─────────────────────┐
            │   React 19 SPA      │
            │   (Vite, Tailwind)  │
            └──────────┬──────────┘
                       │ axios + Sanctum cookie sessions
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

- The backend is a stateless JSON API; every authenticated route sits behind Sanctum
  stateful middleware plus `role:` and `approved` gates.
- The frontend is a single SPA with per-role route trees and a single navigation source
  of truth (`src/config/navigation.jsx`).
- The payment ledger lives in its own database and connection; the main schema never
  assumes the payments table exists on the primary connection.

## 4. User Roles & Permissions

| Role | Dashboard | Sees |
| ---- | --------- | ---- |
| Admin | `/dashboard` | Everything: students, courses, exams, franchises, faculty, corporate, payments, communication, users, reports |
| Faculty | `/faculty` | Only assigned course/batch data — materials, classes, attendance, assignments, exams, results, certificates, payouts |
| Student | `/student` | Own data only — enrollment, learning, exams, results, certificates, fees |
| Franchise | `/franchise` | Own franchise only — students stamped with `students.franchise_id`, their enrollments, revenue and commission |
| Employee | `/employee` | Own employment profile, certificates, company announcements, directory |

Authorization is enforced **server-side** on every route group (`EnsureUserHasRole`,
`EnsureUserIsApproved`) plus ownership checks inside each controller. The frontend route
guards mirror this, but the API is the final authority. The automated test suite
(`backend/tests/Feature/RoleAccessControlTest.php`) pins the matrix: each role's own APIs
answer 200 and every other role gets 403.

## 5. Authentication & Security

**Two-step login for every account** — credentials → emailed 6-digit OTP → session.
Codes are bcrypt-hashed at rest, single-use, attempt-locked (5), cooldown- and
rate-limited. The verification is bound to the pending user id, so a verification can
never be replayed for a different account, and the session id is regenerated on login.

**Registration** is whitelisted server-side (student/faculty/franchise — no admin), the
identity is locked after the signup OTP, and every new account starts unapproved until an
admin approves it.

**Password reset** combines personal-detail verification (per-account failure lockout)
with an OTP. **Profile password changes** accept either the current password or a hashed,
cooldown-limited OTP.

**Public endpoints** (certificate verification, ID-card PDFs, admit-card PDFs) resolve by
non-sequential tokens or certificate numbers — never by database id.

## 6. Payments & Communication

The ERP is the payment system — no external gateway:

```
Enrollment → student uploads payment proof → admin verifies → admin marks paid → admin approves
```

Every admin-recorded payment writes a row to the `zyncro_erp_payments` ledger, so
revenue, the student's payment history and the fee rows stay reconciled. Bulk email is
queued one job per recipient with retries and a per-recipient log trail.

---

## 7. Visual Application Tour

All screenshots are authentic captures from the running application (1440×900 desktop,
Retina), taken after the audit fixes were verified. Test accounts: see
[Local Development](#8-local-development).

#### Shared — Authentication

**01 Login Page**

The sign-in page. Credentials are checked first (POST `/api/login-check`), then a one-time code is required — every account, including admins, authenticates in two steps.

![01 login page](docs/screenshots/shared/authentication/01-login-page.png)

**02 Login Two Step Security Check**

After the password is accepted, the security-check step asks the user to send a verification code to their email. The pending login is stored server-side; no session is created yet.

![02 login two step security check](docs/screenshots/shared/authentication/02-login-two-step-security-check.png)

**03 Login Otp Modal**

The 6-digit code modal with a resend cooldown. Codes are hashed at rest, single-use, and locked after five wrong attempts.

![03 login otp modal](docs/screenshots/shared/authentication/03-login-otp-modal.png)

**04 Register Page**

Self-service registration (`/register`). Only student, faculty and franchise roles can self-register; the role is validated server-side.

![04 register page](docs/screenshots/shared/authentication/04-register-page.png)

**05 Register Details Filled**

Stage 1 filled: name, email and role. Clicking **Verify** issues a signup OTP.

![05 register details filled](docs/screenshots/shared/authentication/05-register-details-filled.png)

**06 Register Otp Modal**

The signup OTP modal — with resend and countdown. Verification binds the email to the pending signup in the server session.

![06 register otp modal](docs/screenshots/shared/authentication/06-register-otp-modal.png)

**07 Register Info Stage**

After verification the identity fields are locked (the OTP was issued for exactly this name/email/role) and the profile stage follows.

![07 register info stage](docs/screenshots/shared/authentication/07-register-info-stage.png)

**08 Register Confirm Stage**

Stage 3: choosing a password (minimum 8 characters, aligned with the profile-change policy).

![08 register confirm stage](docs/screenshots/shared/authentication/08-register-confirm-stage.png)

**09 Register Success**

Registration completes and redirects to the login page. New accounts start unapproved.

![09 register success](docs/screenshots/shared/authentication/09-register-success.png)

**10 Pending Approval**

Until an administrator approves the account, every login lands on the pending-approval screen and all dashboard APIs reject the session.

![10 pending approval](docs/screenshots/shared/authentication/10-pending-approval.png)

**11 Forgot Password Entry**

The forgot-password entry point from the login page.

![11 forgot password entry](docs/screenshots/shared/authentication/11-forgot-password-entry.png)

**12 Forgot Password Email**

Step 1 asks for the account email.

![12 forgot password email](docs/screenshots/shared/authentication/12-forgot-password-email.png)

**13 Forgot Password Security**

Step 2 verifies personal details (DOB, country, mobile) with a per-account failure lockout before an OTP is sent.

![13 forgot password security](docs/screenshots/shared/authentication/13-forgot-password-security.png)

**Root Login Light**

Login page in light mode (default theme).

![root login light](docs/screenshots/shared/authentication/root-login-light.png)

**Root Login Dark**

Login page in dark mode. Auth pages are intentionally theme-stable; the dashboards follow the persisted theme.

![root login dark](docs/screenshots/shared/authentication/root-login-dark.png)

#### Shared — Theme & Responsive Shell

**01 Admin Dashboard Dark Mode**

Dark mode across the admin dashboard — the token-based theme system (`--zx-*` surface/text/border variables) drives every surface.

![01 admin dashboard dark mode](docs/screenshots/shared/global-components/01-admin-dashboard-dark-mode.png)

**02 Student List Dark Mode**

The student list in dark mode after the token migration of shared components.

![02 student list dark mode](docs/screenshots/shared/global-components/02-student-list-dark-mode.png)

**03 Admin Mobile View**

The admin shell at a 390px viewport: the sidebar collapses behind a hamburger and content reflows to one column.

![03 admin mobile view](docs/screenshots/shared/global-components/03-admin-mobile-view.png)

#### Public — Mobile QR Attendance

**01 Email Step**

The public QR-attendance page (`/attendance`) used on a student's phone: step 1 requests an OTP bound to the student email. The QR token itself arrives by scanning the code displayed on the staff screen.

![01 email step](docs/screenshots/public/mobile-attendance/01-email-step.png)

**02 Otp Step**

Step 2 verifies the emailed code before attendance can be marked. Codes are single-use, expire in five minutes, and lock after five failed guesses.

![02 otp step](docs/screenshots/public/mobile-attendance/02-otp-step.png)

#### Admin — Dashboard

**01 Dashboard Top**

The administration overview: revenue, students, faculties, courses, pending payments and franchise KPIs, plus the revenue and enrollment charts.

![01 dashboard top](docs/screenshots/admin/dashboard/01-dashboard-top.png)

**02 Dashboard Bottom**

The lower dashboard: academic infrastructure stats and recent enrollments, transactions and registrations with quick links into each module.

![02 dashboard bottom](docs/screenshots/admin/dashboard/02-dashboard-bottom.png)

#### Admin — Student Management · Add Student (3-stage wizard)

**01 Stage 01 Details**

Add Student stage 1 — the three-stage onboarding wizard starts with identity and course/batch assignment.

![01 stage 01 details](docs/screenshots/admin/student-management/add-student/01-stage-01-details.png)

**01 Stage 01 Details Filled**

Stage 1 filled for a new student. Course and batch are validated against each other server-side.

![01 stage 01 details filled](docs/screenshots/admin/student-management/add-student/01-stage-01-details-filled.png)

**02 Stage 02 Preview**

Stage 2 — reviewing the details before confirmation.

![02 stage 02 preview](docs/screenshots/admin/student-management/add-student/02-stage-02-preview.png)

**03 Stage 03 Confirm**

Stage 3 — confirmation. Creating the student provisions the login (random password emailed), the enrollment and the fee row in one transaction.

![03 stage 03 confirm](docs/screenshots/admin/student-management/add-student/03-stage-03-confirm.png)

**05 Success**

The success state. If the credentials email cannot be delivered, the response says so explicitly and points to **Reset Login**.

![05 success](docs/screenshots/admin/student-management/add-student/05-success.png)

#### Admin — Student Management · View & Manage Students

**01 Student List Default**

View & Manage Students — the roster with per-row actions (view, edit, reset login, delete) and expandable detail rows.

![01 student list default](docs/screenshots/admin/student-management/student-list/01-student-list-default.png)

**02 Student List Search Active**

Search in use — filtering the roster by name or SID.

![02 student list search active](docs/screenshots/admin/student-management/student-list/02-student-list-search-active.png)

**04 Student View Modal**

The student detail modal with contact and enrollment information.

![04 student view modal](docs/screenshots/admin/student-management/student-list/04-student-view-modal.png)

**05 Student Edit Modal**

The edit modal. Email changes sync the student's login identity.

![05 student edit modal](docs/screenshots/admin/student-management/student-list/05-student-edit-modal.png)

**06 Student Delete Confirm**

The delete confirmation — destructive actions always confirm, and the confirm button supports custom labels and a busy state.

![06 student delete confirm](docs/screenshots/admin/student-management/student-list/06-student-delete-confirm.png)

#### Admin — Student Management · Enrollment Center (proof → payment → approval)

**01 Enrollment Center**

The Enrollment Center — every enrollment with status and payment status, plus the inline create panel (student, course, batch and optional franchise assignment).

![01 enrollment center](docs/screenshots/admin/student-management/enrollment-center/01-enrollment-center.png)

**02 Enrollment Center Bottom**

The lower section with the creation form and further enrollments.

![02 enrollment center bottom](docs/screenshots/admin/student-management/enrollment-center/02-enrollment-center-bottom.png)

**05 Enrollment With Proof**

The enrollment drawer for a pending enrollment: the student uploaded a payment proof and it is awaiting review.

![05 enrollment with proof](docs/screenshots/admin/student-management/enrollment-center/05-enrollment-with-proof.png)

**06 Proof Verified**

After **Verify**, the proof is marked verified — this is a prerequisite for both marking paid and approving.

![06 proof verified](docs/screenshots/admin/student-management/enrollment-center/06-proof-verified.png)

**07 Mark Paid Modal**

Recording the fee payment inline (₹24,000 of ₹24,000).

![07 mark paid modal](docs/screenshots/admin/student-management/enrollment-center/07-mark-paid-modal.png)

**08 Payment Recorded**

Payment recorded: the fee row flips to `paid` and a row is written to the payments ledger (`payment_mode = offline`).

![08 payment recorded](docs/screenshots/admin/student-management/enrollment-center/08-payment-recorded.png)

**09 Approve Confirm**

Approval is enabled only once the proof is verified and the fee is fully paid (free courses are approvable on a verified proof alone).

![09 approve confirm](docs/screenshots/admin/student-management/enrollment-center/09-approve-confirm.png)

**10 Enrollment Approved**

The enrollment is now `active` — the student gains access to course content, exams and materials.

![10 enrollment approved](docs/screenshots/admin/student-management/enrollment-center/10-enrollment-approved.png)

#### Admin — Student Management · Digital ID Cards

**01 Id Cards Page**

Digital ID card management with the active/inactive filter.

![01 id cards page](docs/screenshots/admin/student-management/id-cards/01-id-cards-page.png)

**02 Id Card Activate Confirm**

Activation confirms that any previous card (and its public PDF link) is replaced.

![02 id card activate confirm](docs/screenshots/admin/student-management/id-cards/02-id-card-activate-confirm.png)

**03 Id Card Activated**

The card is active; the view and print actions unlock.

![03 id card activated](docs/screenshots/admin/student-management/id-cards/03-id-card-activated.png)

**04 Id Card Pdf Preview**

The printable ID-card PDF, served publicly through the card's non-sequential token with a locally generated QR.

![04 id card pdf preview](docs/screenshots/admin/student-management/id-cards/04-id-card-pdf-preview.png)

#### Admin — Attendance

**01 Manage Attendance**

The QR attendance hub: launch sessions, monitor ongoing ones and fetch the attendance report matrix.

![01 manage attendance](docs/screenshots/admin/attendance/01-manage-attendance.png)

**02 Start Attendance Modal**

Starting a session for a course/batch pair — a 10-minute window with a unique QR token.

![02 start attendance modal](docs/screenshots/admin/attendance/02-start-attendance-modal.png)

**04 Start Validation Error**

Validation state: launching without both course and batch shows an inline error.

![04 start validation error](docs/screenshots/admin/attendance/04-start-validation-error.png)

**03 Live Qr Session**

The live session: QR code rendered locally by the app (no third-party service), countdown, and end-session control.

![03 live qr session](docs/screenshots/admin/attendance/03-live-qr-session.png)

#### Admin — Course Management · Courses & Batches

**01 Add Courses Page**

Add Courses — course creation plus inline batch management.

![01 add courses page](docs/screenshots/admin/course-management/courses/01-add-courses-page.png)

**02 Manage Courses**

Manage Courses — edit, toggle status and delete (guarded when exams, enrollments or fee rows reference the course).

![02 manage courses](docs/screenshots/admin/course-management/courses/02-manage-courses.png)

**03 Manage Courses Batches Expanded**

A course expanded to show its batches and batch-level actions.

![03 manage courses batches expanded](docs/screenshots/admin/course-management/courses/03-manage-courses-batches-expanded.png)

**04 Edit Course Modal**

The course edit modal. Price changes propagate to not-yet-paid fee rows.

![04 edit course modal](docs/screenshots/admin/course-management/courses/04-edit-course-modal.png)

#### Admin — Course Management · Study Materials

**01 Manage Study Materials**

Study materials with type badges, status toggles, audience rules and a working search.

![01 manage study materials](docs/screenshots/admin/course-management/study-materials/01-manage-study-materials.png)

**02 Add Material Modal**

The Add Content modal: pdf/video/notes types with client-side file validation (PDF, ≤10 MB).

![02 add material modal](docs/screenshots/admin/course-management/study-materials/02-add-material-modal.png)

**03 Add Material Filled**

A real PDF attached, ready to publish with an audience of all students (course- or batch-scoped audiences are also supported).

![03 add material filled](docs/screenshots/admin/course-management/study-materials/03-add-material-filled.png)

#### Admin — Course Management · Online Classes

**01 Manage Online Classes**

Online classes with time filters (upcoming / live / past), go-live control and the scheduling wizard.

![01 manage online classes](docs/screenshots/admin/course-management/online-classes/01-manage-online-classes.png)

**02 Schedule Lecture Step1**

Wizard step 1 — lecture details, date/time, duration and the recurring toggle.

![02 schedule lecture step1](docs/screenshots/admin/course-management/online-classes/02-schedule-lecture-step1.png)

**03 Schedule Lecture Filled**

Step 1 filled for a session tomorrow evening.

![03 schedule lecture filled](docs/screenshots/admin/course-management/online-classes/03-schedule-lecture-filled.png)

**04 Meeting Platform Step2**

Step 2 — meeting platform (Zoom/Teams/Meet/Other) with link, id and password fields.

![04 meeting platform step2](docs/screenshots/admin/course-management/online-classes/04-meeting-platform-step2.png)

**05 Access Control Step3**

Step 3 — audience: all students, a course, or an exact batch (batch↔course consistency is validated server-side).

![05 access control step3](docs/screenshots/admin/course-management/online-classes/05-access-control-step3.png)

**06 Online Classes After Create**

The list after publishing — the class appears as `scheduled` and is visible to the targeted students.

![06 online classes after create](docs/screenshots/admin/course-management/online-classes/06-online-classes-after-create.png)

#### Admin — Exam Management · Assignments

**01 Assignments List**

Manage Assignments — assignments per course/batch with deadlines and submission counts.

![01 assignments list](docs/screenshots/admin/exam-management/assignments/01-assignments-list.png)

**02 Create Assignment Modal**

The create modal with question text, optional attachment (pdf/doc/ppt/zip, ≤20 MB) and deadline.

![02 create assignment modal](docs/screenshots/admin/exam-management/assignments/02-create-assignment-modal.png)

**03 Submissions Modal**

The submissions modal — per-student submissions with link/file viewing (served through the shared, role-checked file route).

![03 submissions modal](docs/screenshots/admin/exam-management/assignments/03-submissions-modal.png)

#### Admin — Exam Management · Scheduling & Managing Exams

**01 Step1 Basic Info**

Schedule Exam stage 1 — name, description, course/batch and category.

![01 step1 basic info](docs/screenshots/admin/exam-management/exams/01-step1-basic-info.png)

**01 Step2 Timing**

Stage 2 — start time and duration; the end time is derived and the wizard prevents past starts.

![01 step2 timing](docs/screenshots/admin/exam-management/exams/01-step2-timing.png)

**01 Step3 Delivery**

Stage 3 — delivery mode: online (platform + link) or offline (center + notes).

![01 step3 delivery](docs/screenshots/admin/exam-management/exams/01-step3-delivery.png)

**01 Step4 Review**

Stage 4 — review of every exam parameter.

![01 step4 review](docs/screenshots/admin/exam-management/exams/01-step4-review.png)

**01 Step5 Confirm**

Stage 5 — confirmation before scheduling.

![01 step5 confirm](docs/screenshots/admin/exam-management/exams/01-step5-confirm.png)

**01 Step5 After Submit**

The scheduled exam appears in the list; its lifecycle state is derived from time (upcoming → live → past) and guards all edits.

![01 step5 after submit](docs/screenshots/admin/exam-management/exams/01-step5-after-submit.png)

**04 Manage Exams List**

View & Manage Exams — the management list with view/postpone/cancel actions and time-based guards.

![04 manage exams list](docs/screenshots/admin/exam-management/exams/04-manage-exams-list.png)

**07 Step1 Basic Info**

A second scheduling run (the mid-term assessment), stage 1.

![07 step1 basic info](docs/screenshots/admin/exam-management/exams/07-step1-basic-info.png)

**07 Step2 Timing**

Mid-term scheduling, stage 2.

![07 step2 timing](docs/screenshots/admin/exam-management/exams/07-step2-timing.png)

**07 Step3 Delivery**

Mid-term scheduling, stage 3.

![07 step3 delivery](docs/screenshots/admin/exam-management/exams/07-step3-delivery.png)

**07 Step4 Review**

Mid-term scheduling, review.

![07 step4 review](docs/screenshots/admin/exam-management/exams/07-step4-review.png)

**07 Step5 Confirm**

Mid-term scheduling, confirmation.

![07 step5 confirm](docs/screenshots/admin/exam-management/exams/07-step5-confirm.png)

**07 Step5 After Submit**

Both exams in the management list — the mid-term is derived as PAST once its end time passes, which locks editing and enables result publishing.

![07 step5 after submit](docs/screenshots/admin/exam-management/exams/07-step5-after-submit.png)

#### Admin — Exam Management · Admit Cards

**01 Admit Cards Exam List**

Admit cards start from the exam list (cancelled and past exams excluded).

![01 admit cards exam list](docs/screenshots/admin/exam-management/admit-cards/01-admit-cards-exam-list.png)

**02 Admit Cards Student List**

The enrolled students of the selected exam with per-student generation state.

![02 admit cards student list](docs/screenshots/admin/exam-management/admit-cards/02-admit-cards-student-list.png)

**03 Admit Card Generated**

A card generated for an actively enrolled student (enrollment is verified server-side).

![03 admit card generated](docs/screenshots/admin/exam-management/admit-cards/03-admit-card-generated.png)

**04 Admit Card Pdf Preview**

The printable admit-card PDF — resolved publicly by non-sequential token, never by database id.

![04 admit card pdf preview](docs/screenshots/admin/exam-management/admit-cards/04-admit-card-pdf-preview.png)

#### Admin — Exam Management · Publish Results

**01 Publish Results Page**

Publish Results — choose a course/batch and load the results matrix of past exams.

![01 publish results page](docs/screenshots/admin/exam-management/results/01-publish-results-page.png)

**02 Results Matrix**

The matrix: students × exams with existing scores, averages and lock icons for issued certificates.

![02 results matrix](docs/screenshots/admin/exam-management/results/02-results-matrix.png)

**03 Student Row Expanded**

Expanding a student row opens the action row.

![03 student row expanded](docs/screenshots/admin/exam-management/results/03-student-row-expanded.png)

**04 Results Scores Filled**

Entering scores (0–100, client-validated). Results can only be saved after the exam has ended, for actively enrolled students, inside a transaction.

![04 results scores filled](docs/screenshots/admin/exam-management/results/04-results-scores-filled.png)

**05 Results Saved**

Scores saved — passed/failed certificate eligibility is updated automatically; absentees (blank score) no longer mint failed certificates.

![05 results saved](docs/screenshots/admin/exam-management/results/05-results-saved.png)

#### Admin — Exam Management · Issue Certificates

**01 Certificates List**

Issue Certificates — one row per exam result with pass/fail status and issuance state.

![01 certificates list](docs/screenshots/admin/exam-management/certificates/01-certificates-list.png)

**02 Certificates Row Expanded**

Expanding a result exposes the management actions.

![02 certificates row expanded](docs/screenshots/admin/exam-management/certificates/02-certificates-row-expanded.png)

**03 Issue Confirm Modal**

Issuing a passed certificate mints a non-sequential certificate number and stamps the issuer.

![03 issue confirm modal](docs/screenshots/admin/exam-management/certificates/03-issue-confirm-modal.png)

**04 Certificate Issued**

Issued — the public PDF and verification link become live.

![04 certificate issued](docs/screenshots/admin/exam-management/certificates/04-certificate-issued.png)

**05 Failed Cert Blocked**

A failed exam cannot be issued — and since the audit fix, a course certificate is also refused while any exam in that course/batch is failed.

![05 failed cert blocked](docs/screenshots/admin/exam-management/certificates/05-failed-cert-blocked.png)

#### Admin — Franchise Management

**01 Add Franchise**

Add Franchise — profile details with an optional owner login (credentials emailed).

![01 add franchise](docs/screenshots/admin/franchise-management/01-add-franchise.png)

**02 Manage Franchise**

Manage Franchises — edit, enable/disable (a disabled franchise loses dashboard access immediately) and delete (the owner login is retired too).

![02 manage franchise](docs/screenshots/admin/franchise-management/02-manage-franchise.png)

**03 Franchise View Modal**

The franchise detail modal.

![03 franchise view modal](docs/screenshots/admin/franchise-management/03-franchise-view-modal.png)

#### Admin — Faculty Management · Faculty

**01 Add Faculty**

Add Faculty — profile with optional franchise membership; credentials are emailed after the transaction commits.

![01 add faculty](docs/screenshots/admin/faculty-management/faculty/01-add-faculty.png)

**02 Manage Faculty**

Manage Faculties — view, edit (login email kept in sync), reset login and delete.

![02 manage faculty](docs/screenshots/admin/faculty-management/faculty/02-manage-faculty.png)

#### Admin — Faculty Management · Assign Courses

**01 Assign Courses**

Assign Courses — mapping faculty to course/batch pairs. This assignment table is the single source of faculty data scoping across the whole ERP.

![01 assign courses](docs/screenshots/admin/faculty-management/assign-courses/01-assign-courses.png)

#### Admin — Corporate Management · Roles

**01 Roles**

Corporate roles — deletion is blocked while any employee holds the role (the FK would otherwise cascade-delete people).

![01 roles](docs/screenshots/admin/corporate-management/roles/01-roles.png)

#### Admin — Corporate Management · Employees

**01 Add Employee**

Add Employee — HR profile with an optional login (off by default; sequential EMP ids are generated under lock).

![01 add employee](docs/screenshots/admin/corporate-management/employees/01-add-employee.png)

**02 Manage Employees**

Manage Employees — edits sync the linked login identity; termination removes the login.

![02 manage employees](docs/screenshots/admin/corporate-management/employees/02-manage-employees.png)

#### Admin — Corporate Management · Certificates

**01 Issue Certificate**

Corporate certificates with public verification URLs (validated field list; non-sequential certificate numbers).

![01 issue certificate](docs/screenshots/admin/corporate-management/certificates/01-issue-certificate.png)

#### Admin — Corporate Management · Announcements

**01 Announcements**

Company announcements published to the employee portal.

![01 announcements](docs/screenshots/admin/corporate-management/announcements/01-announcements.png)

#### Admin — Payments · Hub

**01 Payment Management**

The payments hub — entry points to student fees, franchise payments, faculty payouts and history.

![01 payment management](docs/screenshots/admin/payments/manage/01-payment-management.png)

#### Admin — Payments · Student Fees

**01 Student Fees**

Student fees — one row per (student, course); the unique constraint added in this release makes the per-course split explicit.

![01 student fees](docs/screenshots/admin/payments/student-fees/01-student-fees.png)

**02 Fee Row Expanded**

The expanded fee row: edit the paid amount (overpay is rejected) or mark fully paid.

![02 fee row expanded](docs/screenshots/admin/payments/student-fees/02-fee-row-expanded.png)

#### Admin — Payments · Franchise Payments

**01 Franchise Payments**

Franchise payments — recorded totals, paid amounts and the derived status, plus the global commission rate editor.

![01 franchise payments](docs/screenshots/admin/payments/franchise-payments/01-franchise-payments.png)

#### Admin — Payments · Faculty Payouts

**01 Faculty Payouts**

Faculty payouts — salary management per month with a history modal; future months and paid-month overwrites are refused.

![01 faculty payouts](docs/screenshots/admin/payments/faculty-payouts/01-faculty-payouts.png)

#### Admin — Payments · Payment History

**01 Payment History**

The payments ledger — external payments plus the offline payments recorded from the Enrollment Center.

![01 payment history](docs/screenshots/admin/payments/payment-history/01-payment-history.png)

#### Admin — Communication · Bulk Emails

**01 Send Bulk Emails**

Bulk email — recipient picker by role with search and select-all.

![01 send bulk emails](docs/screenshots/admin/communication/bulk-emails/01-send-bulk-emails.png)

**02 Compose Modal**

The compose modal; sending queues one job per recipient with retries and per-recipient logs.

![02 compose modal](docs/screenshots/admin/communication/bulk-emails/02-compose-modal.png)

#### Admin — Communication · Email Logs

**01 Email Logs**

Email logs — one row per attempted send with success/failure drill-down (content rendered as sanitized text).

![01 email logs](docs/screenshots/admin/communication/email-logs/01-email-logs.png)

#### Admin — Communication · Student Communications

**01 Manage Communications**

Student communications — notices with audience rules (all / course / batch) and publish toggles.

![01 manage communications](docs/screenshots/admin/communication/student-communications/01-manage-communications.png)

**02 View Communication Modal**

The view modal now renders the real audience from the eager-loaded access rules.

![02 view communication modal](docs/screenshots/admin/communication/student-communications/02-view-communication-modal.png)

#### Admin — User Access Control · Add User

**01 Add User**

Add User — student/faculty/admin logins (franchise and employee logins are provisioned by their dedicated flows, as the helper text explains).

![01 add user](docs/screenshots/admin/user-management/add/01-add-user.png)

#### Admin — User Access Control · Manage Users

**01 Manage Users**

Manage users with reset-credentials and delete confirmations.

![01 manage users](docs/screenshots/admin/user-management/manage/01-manage-users.png)

#### Admin — User Access Control · Approve Pending Users

**01 Pending Users**

Approve Pending Users — the approval queue.

![01 pending users](docs/screenshots/admin/user-management/pending/01-pending-users.png)

**02 Pending Users List**

A freshly registered account waiting for approval.

![02 pending users list](docs/screenshots/admin/user-management/pending/02-pending-users-list.png)

**03 Approve Confirm**

The approval confirmation.

![03 approve confirm](docs/screenshots/admin/user-management/pending/03-approve-confirm.png)

**04 User Approved**

Approved — the account can now sign in to its dashboard.

![04 user approved](docs/screenshots/admin/user-management/pending/04-user-approved.png)

#### Admin — Reports & Analytics

**01 Attendance Report**

The attendance report matrix — sessions as columns, students as rows (this run shows the attendance marked during the E2E walkthrough).

![01 attendance report](docs/screenshots/admin/reports/01-attendance-report.png)

**02 Payment Analytics**

Payment analytics — revenue KPIs, status split and course revenue.

![02 payment analytics](docs/screenshots/admin/reports/02-payment-analytics.png)

#### Admin — Profile

**01 Manage Profile**

Manage Profile (shared by admin/faculty/franchise/student) — profile fields, password change with the current password, or an OTP-based change.

![01 manage profile](docs/screenshots/admin/profile/01-manage-profile.png)

#### Student — Dashboard & Enrollment

**01 Student Home Top**

The student home: identity card with the active enrollment, live counters for materials/classes/assignments/certificates, and learning/examination quick links.

![01 student home top](docs/screenshots/student/dashboard/01-student-home-top.png)

**02 Student Home Bottom**

The lower home: financial tracking per course with paid/total progress.

![02 student home bottom](docs/screenshots/student/dashboard/02-student-home-bottom.png)

**03 Enroll Course**

Enroll Course — the catalog of active course/batch pairs with already-enrolled states and a confirmation dialog before requesting enrollment.

![03 enroll course](docs/screenshots/student/dashboard/03-enroll-course.png)

**04 Student Home Pending Enrollment**

The home of a student with a **pending** enrollment — action cards guide them to upload a payment proof and track fees.

![04 student home pending enrollment](docs/screenshots/student/dashboard/04-student-home-pending-enrollment.png)

#### Student — My Learning · My Courses

**01 My Courses**

My Courses — enrolled courses with status badges.

![01 my courses](docs/screenshots/student/my-learning/my-courses/01-my-courses.png)

**02 Course Details Modal**

The course detail modal with course, batch and enrollment info.

![02 course details modal](docs/screenshots/student/my-learning/my-courses/02-course-details-modal.png)

#### Student — My Learning · Study Materials

**01 Study Materials**

Study materials the student is entitled to (via audience rules), with inline PDF/notes viewers and video links.

![01 study materials](docs/screenshots/student/my-learning/study-materials/01-study-materials.png)

#### Student — My Learning · Online Classes

**01 Online Classes**

Online classes with join links for scheduled/live sessions.

![01 online classes](docs/screenshots/student/my-learning/online-classes/01-online-classes.png)

**02 Class Details Modal**

The class detail modal with meeting details and join button.

![02 class details modal](docs/screenshots/student/my-learning/online-classes/02-class-details-modal.png)

#### Student — My Learning · Digital ID Card

**01 Digital Id Card**

The digital ID card page — activated cards expose the public PDF and download links.

![01 digital id card](docs/screenshots/student/my-learning/id-card/01-digital-id-card.png)

**02 Id Card Pdf Preview**

The ID-card PDF preview (public token URL, locally generated QR).

![02 id card pdf preview](docs/screenshots/student/my-learning/id-card/02-id-card-pdf-preview.png)

#### Student — My Learning · QR Attendance

**01 Qr Attendance**

QR attendance — polls for the live session, opens the scan modal, and shows the personal attendance history.

![01 qr attendance](docs/screenshots/student/my-learning/attendance/01-qr-attendance.png)

#### Student — Examinations · My Exams

**01 My Exams**

My Exams — upcoming and past exams for the student's enrollments.

![01 my exams](docs/screenshots/student/exams/exams/01-my-exams.png)

**02 Exam Details Modal**

The exam detail modal with mode-specific join/venue information.

![02 exam details modal](docs/screenshots/student/exams/exams/02-exam-details-modal.png)

#### Student — Examinations · Assignments (with real submission)

**01 Assignments List**

My Assignments — active assignments with deadlines and submission state.

![01 assignments list](docs/screenshots/student/exams/assignments/01-assignments-list.png)

**02 Assignment Modal**

The submission modal: response link and/or file upload (type and size validated client-side too).

![02 assignment modal](docs/screenshots/student/exams/assignments/02-assignment-modal.png)

**03 Assignment File Uploaded**

A file attached and ready to submit — uploads are bound to the assignment and refused after the deadline.

![03 assignment file uploaded](docs/screenshots/student/exams/assignments/03-assignment-file-uploaded.png)

**04 Assignment Submitted**

Submitted — the modal flips to the success state with the timestamp; further uploads are blocked.

![04 assignment submitted](docs/screenshots/student/exams/assignments/04-assignment-submitted.png)

#### Student — Examinations · Admit Cards

**01 My Admit Cards**

My Admit Cards — cards issued to this student.

![01 my admit cards](docs/screenshots/student/exams/admit-cards/01-my-admit-cards.png)

**02 Admit Card View Modal**

The admit-card detail modal.

![02 admit card view modal](docs/screenshots/student/exams/admit-cards/02-admit-card-view-modal.png)

**03 Admit Card Pdf**

The official PDF opened from the token-based public route.

![03 admit card pdf](docs/screenshots/student/exams/admit-cards/03-admit-card-pdf.png)

#### Student — Examinations · Results

**01 My Results Page**

My Results — pick an enrollment to load the student's own results.

![01 my results page](docs/screenshots/student/exams/results/01-my-results-page.png)

**02 Results Loaded**

Results loaded with per-exam scores and the cumulative average.

![02 results loaded](docs/screenshots/student/exams/results/02-results-loaded.png)

#### Student — Certificates

**01 My Certificates**

My Certificates — earned certificates per enrollment.

![01 my certificates](docs/screenshots/student/certificates/01-my-certificates.png)

**02 Certificate Selected**

Selecting an enrollment lists its certificates with public PDF/verification links.

![02 certificate selected](docs/screenshots/student/certificates/02-certificate-selected.png)

#### Student — Payments · Upload Payment Proof

**01 Upload Payment Proof**

Upload Payment Proof — one card per enrollment needing payment; rejected proofs show the admin's remarks.

![01 upload payment proof](docs/screenshots/student/payments/upload-proof/01-upload-payment-proof.png)

**02 Proof File Selected**

A PDF proof attached (pdf/jpg/png ≤10 MB, validated before upload).

![02 proof file selected](docs/screenshots/student/payments/upload-proof/02-proof-file-selected.png)

**03 Proof Uploaded**

Uploaded — the proof flips to `Verification Pending` and the admin is notified in the Enrollment Center.

![03 proof uploaded](docs/screenshots/student/payments/upload-proof/03-proof-uploaded.png)

#### Student — Payments · Fee Payments

**01 Make Payment**

Fee Payments — per-enrollment payment status with a hand-off to the proof upload for unsettled fees.

![01 make payment](docs/screenshots/student/payments/make-payment/01-make-payment.png)

#### Student — Payments · Track Course Fees

**01 Track Course Fees**

Track Course Fees — total/paid/balance per course with status rows.

![01 track course fees](docs/screenshots/student/payments/track-fees/01-track-course-fees.png)

#### Student — Payments · Payment History

**01 Payment History**

Payment history — ledger entries belonging to the student, including offline payments recorded by the office.

![01 payment history](docs/screenshots/student/payments/history/01-payment-history.png)

#### Student — Communication

**01 Communications**

Student communications matched by the audience rules of the student's enrollments.

![01 communications](docs/screenshots/student/communication/01-communications.png)

**02 Communication View Modal**

The notice detail modal.

![02 communication view modal](docs/screenshots/student/communication/02-communication-view-modal.png)

#### Student — Profile

**01 Manage Profile**

The student's profile and security settings (password change with old password, or via emailed OTP).

![01 manage profile](docs/screenshots/student/profile/01-manage-profile.png)

#### Faculty — Dashboard & Profile

**01 Faculty Home**

The faculty home: personalized greeting, assignment KPIs, the course table and recent activity lists with working View-All links.

![01 faculty home](docs/screenshots/faculty/dashboard/01-faculty-home.png)

**02 Faculty Profile**

The faculty profile page (shared ManageProfile).

![02 faculty profile](docs/screenshots/faculty/dashboard/02-faculty-profile.png)

#### Faculty — Teaching

**01 My Courses**

My Courses — only the course/batch pairs the faculty is assigned to.

![01 my courses](docs/screenshots/faculty/teaching/01-my-courses.png)

**02 My Students**

My Students — active enrollments across the assigned pairs.

![02 my students](docs/screenshots/faculty/teaching/02-my-students.png)

**03 Student View Modal**

The student detail modal (scoped to the faculty's own students).

![03 student view modal](docs/screenshots/faculty/teaching/03-student-view-modal.png)

#### Faculty — Content

**01 Study Materials**

Faculty materials — the faculty can create content for their assignments; the creator can attach the first audience rule, and global content is read-only for others.

![01 study materials](docs/screenshots/faculty/content/01-study-materials.png)

**02 Online Classes**

Faculty online classes — same scoping, including go-live.

![02 online classes](docs/screenshots/faculty/content/02-online-classes.png)

**03 Qr Attendance**

Faculty QR attendance — sessions for assigned course/batch pairs.

![03 qr attendance](docs/screenshots/faculty/content/03-qr-attendance.png)

#### Faculty — Assessment

**01 Assignments**

Faculty assignments — create and review for assigned batches.

![01 assignments](docs/screenshots/faculty/assessment/01-assignments.png)

**02 Submissions Modal**

The submissions modal with the student's uploaded file (role-checked download).

![02 submissions modal](docs/screenshots/faculty/assessment/02-submissions-modal.png)

**03 Schedule Exam**

Faculty exam scheduling — identical wizard, scoped to assigned course/batch pairs.

![03 schedule exam](docs/screenshots/faculty/assessment/03-schedule-exam.png)

**04 Manage Exams**

Faculty exam management with the same time-based lifecycle guards.

![04 manage exams](docs/screenshots/faculty/assessment/04-manage-exams.png)

**05 Admit Cards**

Faculty admit cards — generation verifies each student's enrollment.

![05 admit cards](docs/screenshots/faculty/assessment/05-admit-cards.png)

**06 Results**

Faculty results — every submitted score row is authorized against the faculty's assignments.

![06 results](docs/screenshots/faculty/assessment/06-results.png)

#### Faculty — Certificates

**01 Issue Certificates**

Faculty certificate issuance for their own batches, subject to the same eligibility rules.

![01 issue certificates](docs/screenshots/faculty/certificates/01-issue-certificates.png)

#### Faculty — Communication

**01 Announcements**

Faculty announcements — communications the faculty owns or targets their batches.

![01 announcements](docs/screenshots/faculty/communication/01-announcements.png)

#### Faculty — Finance

**01 My Payouts**

My Payouts — per-month salary records with paid/unpaid status.

![01 my payouts](docs/screenshots/faculty/finance/01-my-payouts.png)

#### Faculty — Reports

**01 Attendance Report**

Faculty attendance report for assigned course/batch pairs.

![01 attendance report](docs/screenshots/faculty/reports/01-attendance-report.png)

#### Franchise — Dashboard

**01 Franchise Home**

The franchise home after the franchise-assignment fix: own students, active enrollments, faculty, collected fees, outstanding fees and the commission estimate.

![01 franchise home](docs/screenshots/franchise/dashboard/01-franchise-home.png)

#### Franchise — Students

**01 My Students**

My Students — server-side search, status chips and pagination, strictly scoped to the franchise.

![01 my students](docs/screenshots/franchise/students/01-my-students.png)

#### Franchise — Enrollments

**01 Enrollments**

Enrollments of the franchise's students with status and payment status.

![01 enrollments](docs/screenshots/franchise/enrollments/01-enrollments.png)

#### Franchise — Courses

**01 Courses**

Courses the franchise's students are enrolled in, with enrollment and collection figures.

![01 courses](docs/screenshots/franchise/courses/01-courses.png)

#### Franchise — Reports & Analytics

**01 Student Reports**

Student reports for the franchise.

![01 student reports](docs/screenshots/franchise/reports/01-student-reports.png)

**02 Revenue Analytics**

The 12-month revenue chart.

![02 revenue analytics](docs/screenshots/franchise/reports/02-revenue-analytics.png)

#### Franchise — Faculty

**01 Faculty**

Faculty belonging to the franchise.

![01 faculty](docs/screenshots/franchise/faculty/01-faculty.png)

#### Franchise — Announcements

**01 Announcements**

Student communications whose audience includes the franchise's students.

![01 announcements](docs/screenshots/franchise/announcements/01-announcements.png)

#### Franchise — Revenue & Commission

**01 Revenue**

Recorded revenue for the franchise.

![01 revenue](docs/screenshots/franchise/payments/01-revenue.png)

**02 Commission**

The commission rate and the current estimate (rate × collected fees).

![02 commission](docs/screenshots/franchise/payments/02-commission.png)

#### Employee — Dashboard & Account

**01 Employee Home**

The employee home: profile card and quick certificate links.

![01 employee home](docs/screenshots/employee/dashboard/01-employee-home.png)

**02 Account Settings**

Account settings (the shared profile page in the employee shell).

![02 account settings](docs/screenshots/employee/dashboard/02-account-settings.png)

#### Employee — Employment Profile

**01 Employment Profile**

The employment profile — corporate role, department, joining date and status.

![01 employment profile](docs/screenshots/employee/employment/01-employment-profile.png)

#### Employee — Certificates

**01 Certificates**

Corporate certificates with public view/download links.

![01 certificates](docs/screenshots/employee/certificates/01-certificates.png)

#### Employee — Announcements

**01 Announcements**

Company announcements.

![01 announcements](docs/screenshots/employee/announcements/01-announcements.png)

#### Employee — Team Directory

**01 Team Directory**

The team directory — searchable colleagues (contact details intentionally withheld).

![01 team directory](docs/screenshots/employee/directory/01-team-directory.png)


---

## 8. Local Development

```bash
# 1. Services (macOS/Homebrew): MySQL + Mailpit (local SMTP sink)
brew services start mysql mailpit

# 2. Backend
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=localhost --port=8000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173

# 4. Queue worker (bulk email)
cd backend && php artisan queue:work --tries=3
```

Sign in at `http://localhost:5173/login`. The OTP email appears in Mailpit at
[http://localhost:8025](http://localhost:8025).

**Local test accounts** (created by `TestUsersSeeder`, shared password from
`SEED_USER_PASSWORD`, default `Zyncro@2026`; intended for local testing only):

| Role | Email |
| ---- | ----- |
| Admin | `contact@tanishqsingh.in` |
| Faculty | `tanishqsingh@outlook.in` |
| Student | `tanishq@iiitmanipur.ac.in` |
| Franchise | `tanishqsingh.in@gmail.com` |
| Employee | `tanishq.cred@gmail.com` |

## 9. Database & Seeders

```bash
CREATE DATABASE zyncro_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE zyncro_erp_payments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- `TestUsersSeeder` — the five role accounts above plus their profile rows.
- `DemoDataSeeder` — courses, batches, enrollments, fee records, demo students/faculty,
  franchise revenue, payment ledger rows and company announcements.
- The payments ledger table is provisioned by a normal migration on the `payments_db`
  connection (idempotent, so re-runs and the test suite are safe).

## 10. Testing & Quality Assurance

What is verified in this release (details in [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md)):

- **Automated:** `php vendor/bin/phpunit` — 17 tests / 37 assertions, all passing
  (RBAC matrix per role, enrollment state machine, payment ledger + overpay guard,
  fee scoping, certificate eligibility, admit-card enrollment check, results-after-end
  guard, unassigned-faculty isolation).
- **Build:** `npm run build` passes; migrations apply cleanly on MySQL.
- **Browser E2E (Playwright, all five roles):** full 2FA login per role; the complete
  admission lifecycle (self-enrollment → proof upload → verification → payment →
  approval, with the ledger row verified in SQL); assignment submission with a real file;
  exam scheduling → results → certificate issuance (including the blocked-failed case);
  admit cards; ID cards; study material upload; online-class wizard; QR attendance marked
  end-to-end via the OTP flow; registration → pending approval → admin approval.
- **Known test-environment notes:** the QR camera scan was verified at API level
  (headless browsers have no camera); see the testing report for the full list.

## 11. Project Structure

```
backend/
├── app/Http/Controllers/    # Admin/ Faculty/ Student/ Franchise/ Employee/ Attendance/ User/
├── app/Services/            # OtpService, EmailService, FacultyAssignmentService, QrCodeService
├── app/Jobs/                # SendBulkEmailJob (queued, retried, failure-logged)
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
├── screenshots/             # 190 captures, organized by role → module → page/state
├── PROJECT_OVERVIEW.md
├── PROJECT_AUDIT.md
├── TESTING_REPORT.md
└── SCREENSHOT_COVERAGE.md
```

## 12. Known Limitations

Honest accounting — the full list with rationale lives in
[docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md):

- Franchise `total_amount` is admin-entered, not auto-derived from fee collections.
- `faculty_payouts` table/model are unused dead code (real payouts live in
  `faculty_salary_records`).
- No admin endpoint to invalidate/re-issue an admit card (`INVALIDATED` status has no writer).
- Payment history links by email; a `student_id` column on the ledger would be more robust.
- Several admin tables are unpaginated (fine for demo scale; server-side pagination is a
  mechanical follow-up).
- Deployments must add the SPA origin to `SANCTUM_STATEFUL_DOMAINS` and enable
  `SESSION_SECURE_COOKIE` behind HTTPS.

## 13. Documentation Index

| Document | Contents |
| -------- | -------- |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Architecture, roles, module map, workflows |
| [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md) | Audit findings, fixes, and open items |
| [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md) | Executed verification: automated + browser E2E |
| [docs/SCREENSHOT_COVERAGE.md](docs/SCREENSHOT_COVERAGE.md) | The 190-screenshot ledger with exclusions |
