# Zyncro ERP — Project Audit Report

This report records the end-to-end audit performed in October 2026: the areas examined,
the confirmed defects found, the fixes applied, and the items that remain open. Every
finding below was verified in the source before being classified, and every fix was
re-verified through the browser or the automated test suite.

---

## 1. Scope of the audit

- **Backend** — all 60+ controllers across `Admin/`, `Faculty/`, `Student/`,
  `Franchise/`, `Employee/`, `Attendance/`, `User/`, plus models, migrations, services,
  jobs, mailers, middleware, and route definitions.
- **Frontend** — all ~120 pages/components across the five dashboards, the auth pages,
  the shared component library, API client, routing guards and navigation config.
- **Database** — schema, constraints, seeders, and the isolated payments ledger.
- **Security** — authentication flow, 2FA, OTP policies, role/ownership enforcement,
  public endpoints, file handling, rate limiting.
- **UX consistency** — dark-mode coverage, error/empty/loading states, modal behaviour,
  dead controls, form validation.

Method: five parallel deep-audit passes (one per area) cross-checked against
`routes/api.php`, followed by manual verification of each reported finding before
fixing. Confirmed defects only; speculative concerns are listed at the end.

## 2. Critical defects found and fixed

### Security

| # | Finding | Fix |
| - | ------- | --- |
| S1 | **2FA bypass** — the `two_factor_verified` session flag was not bound to the pending user, so an OTP verified for account A could complete a login for account B whose password was known. | Flag is cleared on every new `login-check`/cancel and is bound to `two_factor_verified_user_id`, checked in `login-complete`. Session id regenerated on login. (`PendingLoginController`, `OtpController`) |
| S2 | **Profile password-change OTP brute force** — `send-otp` reset the attempt counter on every send, no resend cooldown, plaintext OTP in cache. | Hashed OTP (`sha256` + `hash_equals`), 60 s resend cooldown, attempt counter survives resends, route throttles. (`ProfileController`, routes) |
| S3 | **Attendance OTP had no per-email lockout** and multiple live codes per email. | Per-email resend cooldown, superseded codes invalidated on re-issue, `attempts` column (new migration) locks a code after 5 wrong tries; failed guesses burn down all live codes. |
| S4 | **Faculty score tampering** — `FacultyExamResultController::save` authorized only `scores[0]`, letting a faculty member write results for exams they are not assigned to. | Every row is authorized against the faculty's assignments; the shared save also verifies the student's active enrollment in the exam's course/batch. |
| S5 | **Faculty with zero assignments saw institution-wide data** (students, exams, assignments, certificates) because an empty OR-group dropped all constraints. | Empty assignment sets now return nothing (`whereRaw('1 = 0')`). |
| S6 | **Faculty could rewrite the audience of any communication** — the access controller never checked the target model. | Write-level authorization added (`authorizeAccessRules(..., forWrite: true)`): ownership or an exact course/batch rule required; a global "all" rule no longer grants write access to anyone. |
| S7 | **Admit card PDF was public by sequential id** (`/api/admit-card/{id}/pdf`). | Public PDF now resolves by non-sequential `qr_token` (`/api/admit-card/token/{token}/pdf`); the id-based route is auth-gated. Frontend links updated. |
| S8 | **Certificate eligibility was per-exam only** — a student with one passed and three failed exams could be issued a course certificate. | Issuance now requires an active/completed enrollment in the certificate's course+batch **and** no failed exam results in that course+batch. |
| S9 | **Public certificate verification endpoint was broken** — queried a non-existent column (`certificate_id`) and non-existent model fields (500 on every call). | Rewritten against the `certificates` table, resolved by non-sequential `certificate_number`, rate-limited. |
| S10 | **Assignment submission had no enrollment or deadline check** — any student could submit to any assignment, even after the deadline. | Active-enrollment check, `status = active` check, and deadline enforcement on both `submit` and the temp-file upload; uploads are bound to a real assignment; duplicate uploads after submission are refused. |
| S11 | **`CorporateCertificateController::store` mass-assigned `$request->all()` with zero validation.** | Explicit validated field list (`employee_id` exists-check included). |
| S12 | **Broken public PDF links** — every public link in the frontend omitted the `/api` prefix (`/id-card/...`, `/certificate/...`), so ID-card and certificate links 404ed. | All public links corrected; admit-card links moved to the token route. |
| S13 | **Suspended franchise kept dashboard access** — the `approved` middleware only checks the user row. | `ResolvesFranchise` aborts 403 when the franchise row is not `active`. |
| S14 | Password policy was inconsistent (min 6 on register/reset, min 8 on profile). | Standardized to min 8. |

### Functional / business logic

| # | Finding | Fix |
| - | ------- | --- |
| F1 | **ID-card activation 500ed** — `expiry_date` is NOT NULL but was never set on create. | Two-year expiry set at activation (refreshed on re-issue); the response now returns the rotated tokens. |
| F2 | **`GET /admin/students/{id}/documents` called a method that did not exist** (500). | `StudentDocumentController::index` implemented. |
| F3 | **Admin-recorded payments never reached the payments ledger** and overpayments were silently clamped. | `markPaid` writes a `Payment` ledger row (`payment_mode = offline`), refuses amounts above the remaining balance, guards terminal enrollment states, and runs in a transaction. |
| F4 | **`AdminStudentFeeController` corrupted sibling fee rows** — updates were keyed by `student_id` only and rewrote `course_id`/`batch_id`. | Fees are scoped per (student, course); course/batch identity is never rewritten; overpay rejected; unique index `(student_id, course_id)` added by migration with duplicate collapse. |
| F5 | **Exam lifecycle used stale stored status** — past exams remained editable/cancellable and admit-card-generatable because the DB status never changed. | All lifecycle guards are now time-based (`start_time`/`end_time` vs now); `update` gained full validation. |
| F6 | **Enrollment state machine had no guards** — approve/reject worked from any state, rejection required no reason, re-approval could resurrect completed enrollments. | Explicit transitions (`pending → active/cancelled`, `active → completed`), remarks required and validated on reject, transactions + locks. Re-application after cancellation revives the row in place (the unique index forbids duplicates). |
| F7 | **`students.franchise_id` was never written anywhere** — every franchise dashboard was permanently empty. | Admin student creation and the Enrollment Center accept a franchise assignment (UI selector added); franchise dashboards now populate. |
| F8 | **Faculty-created materials/classes could never be published** — attaching the first access rule 403ed (the authorization required an existing rule). | The creator may attach the first rule to their own content; write access otherwise requires ownership or a matching course/batch rule. |
| F9 | **Student assignment attachment linked to an admin-only endpoint** (403 for every student); **faculty/admin could not download submission files** (student-only route). | New student attachment endpoint with enrollment checks; the submission-file route moved to a shared authenticated route with per-role checks in the controller. |
| F10 | **Deleting a franchise/employee left their login active.** | Both deletes retire the linked user account. Role deletion is blocked while employees hold the role. |
| F11 | **Course/batch deletion only guarded students** — deleting silently cascaded exams, results, assignments, submissions, enrollments and fee rows. | Deletion now blocked when exams, assignments, enrollments or fee records reference the course/batch. Course price changes propagate to unpaid fee rows. |
| F12 | **Results save was partial-write-prone** (no transaction), allowed future exams, and minted `failed` certificates for absentees. | Transactional save; exam-ended check; enrollment check; null score keeps the result but no longer creates a failed certificate; pass mark extracted to a shared constant. |
| F13 | **Admit-card generation had no enrollment check** — cards could be minted for any student id. | Active enrollment in the exam's course/batch is now verified (admin + faculty paths). Cancelled exams are excluded from generation lists. |
| F14 | **Study material / online-class access used a single `activeEnrollment`** — students with multiple enrollments got 403s on content their other enrollment granted, and completed students lost material access. | Access checks match every active (and, for materials, completed) enrollment with exact course/batch pair matching (the previous independent `whereIn` matching could leak cross-course pairs). |
| F15 | **Student attendance percentage was structurally 100%** (denominator counted only present rows). | Denominator now counts held sessions for the student's enrollments. |
| F16 | **Enrollment-center UI could never approve free courses** (`totalFee > 0` requirement) and used `alert()`/`prompt()` dialogs. | Free courses are approvable once the proof is verified; prompts replaced with inline rejection-reason flows; prop mutation removed. |
| F17 | **"By Course" access assignment always failed** — the UI sent `course_id: null` for course-type rules (422). | Payload fixed in both study-material modals. |
| F18 | **Study-material search input was not connected** to any state. | Wired with a case-insensitive title filter and a dedicated empty state. |
| F19 | **Dashboard page crashed (white screen) when the API failed** (`data.stats` on an error object). | Error state with retry. |
| F20 | **Attendance sessions leaked across roles** through a shared localStorage key; ending a session removed it locally even when the API call failed. | Key scoped per role; local removal only on success; report fetch failures render an error state. |
| F21 | **Two concurrent attendance sessions could start** for the same course/batch. | `active_lock` nullable column + unique index (new migration) guarantees a single active session per pair; start/end maintain the lock in a transaction. |
| F22 | **QR codes were generated by a third-party web service** (`api.qrserver.com`) in two modals and inside the public PDFs (including the compliance-relevant certificate verification page). | Local QR generation via Endroid (`QrCodeService`) and a new `/api/qr` endpoint for the modals. |
| F23 | **Bulk email reported "N emails sent"** for queued jobs, skipped unknown ids silently, and had no length caps. | Reports "queued", flags skipped ids, validates ids and caps subject/content. |
| F24 | **Credential emails failed silently** — the plaintext password is unrecoverable, so an SMTP outage locked new accounts out. | Controllers surface an explicit "email failed — use Reset Login" warning; resets revoke stale state. |
| F25 | **Empty-login users created via User Access Control for franchise/employee roles produced broken dashboards** (no profile row). | User creation restricted to roles it can fully provision; the UI explains that franchise/employee logins come from their dedicated flows. |
| F26 | **Franchise revenue due was hand-typed** and the persisted `franchise_payments.status` column was never set. | Franchise existence validated, overpay rejected, stored status kept in sync with the derived one. |
| F27 | **`AdminFacultyController::update` wrote `''` into `users.email`** when the email was cleared, bricking the login. | Email sync only for non-empty values. |
| F28 | **Employee id generation raced outside the transaction**; employee updates did not sync the linked login; `create_login` defaulted to true. | Id generation moved inside the transaction; update syncs name/email; `create_login` defaults to false. |
| F29 | **Mobile attendance swallowed backend error messages** and could fire multiple mark requests per scan frame. | Scan lock ref (synchronous), backend messages surfaced, success message cleaned up. |
| F30 | **Student pages reported failure as emptiness** (~15 pages) and used blocking `alert()`s. | Error/empty states with retry on the student portal; toasts replace alerts; success feedback added to proof upload. |
| F31 | **Dark mode was broken across the entire student portal and faculty home** (hardcoded light-only classes). | Migrated to the `--zx-*` token system (student pages, FacultyHome, exam modals, profile OTP modal). |
| F32 | **Dashboard revenue chart merged the same month across years** (MySQL-only `DATE_FORMAT`). | Year-month grouping with a sqlite-compatible expression. |
| F33 | **Register page kept name/role editable after email verification** and the signup OTP modal had no resend. | Identity fields lock after verification; resend with 60 s cooldown added. |
| F34 | **`ViewCommunicationModal` always showed "All Students"** — the audience rules were never returned by the index endpoint. | Rules eager-loaded; the modal renders the real audience. |
| F35 | **Email logs rendered `content` as raw HTML** (stored-XSS surface). | Rendered as sanitized text. |
| F36 | **Every write action in the exam lifecycle (and most admin CRUD) was unguarded** — no try/catch, no busy state, silent 422s. | Sweep across ManageExams, PostponeExamModal, ScheduleExam, PublishResults (0–100 clamps), IssueCertificates, AdmitCards, courses, faculty, franchise, payouts, corporate: backend messages surfaced, buttons disabled while saving, modals close only on success. |

### Data integrity

- `student_fees` now enforces one row per (student, course) (unique index + historical dedupe migration).
- `attendance_sessions` guarantees a single active session per course/batch (`active_lock` unique index).
- `attendance_otps` gained an attempts counter (migration) for per-code lockout.
- Faculty status removal migration made sqlite-compatible so the test suite can run.

## 3. Verification

- `php artisan test` — **17 tests / 37 assertions, all passing** (RBAC matrix + business-logic regressions: enrollment transitions, mark-paid ledger + overpay guard, fee scoping, certificate eligibility, admit-card enrollment check, results-before-end guard, unassigned-faculty isolation).
- `npm run build` — production build passes.
- Manual browser E2E (Playwright + system Chrome, headless) covering every role:
  - Full 2FA login per role, logout, pending-approval gating.
  - Student: enrollment request → proof upload (real file) → admin verification → mark-paid → approval → enrollment `active`; assignment submission with real file upload persisted; exam/result/certificate/admit-card consumption; QR attendance marked via OTP (verified in `attendances`).
  - Admin: student creation (3-stage wizard), exam scheduling (5-stage wizard ×2), results publishing, certificate issuance (including the blocked-failed case), admit-card generation + PDF, ID-card activation + public PDF, study material with real PDF upload, online class through the full wizard, communication publishing, corporate flows, payment ledger row confirmed in `zyncro_erp_payments.payments`.
  - Franchise: dashboard populated after the franchise-assignment fix; all pages scoped.
  - Employee: all pages.
  - Registration E2E: signup → OTP verify → profile stages → success → admin approval.

## 4. Known limitations and open items

These are documented deliberately; none of them block the verified workflows above.

1. **Payments ledger reconciliation** — franchise `total_amount` is admin-entered rather than derived from the fee/payments tables. The two sources are now consistent within their own flows but are not automatically reconciled.
2. **`faculty_payouts` table and model are dead code** — real payout history lives in `faculty_salary_records`. Scheduled for removal or implementation.
3. **`AdmitCardStatus::INVALIDATED` has no writer** — no admin endpoint invalidates a re-issues admit cards (generation is `firstOrCreate`). Candidate for a small follow-up endpoint.
4. **Cert-number race** — certificate number generation is check-then-insert with a unique index; a collision under concurrent issuance returns a retryable 409 rather than retrying internally.
5. **Payment history links by email** — `Payment` rows have no student foreign key, so a changed email orphan history. A `student_id` column on the ledger would fix this but is a schema change on the money trail, deliberately not made during this pass.
6. **Faculty report/dashboard pagination** — several admin tables (students, users, logs) are unpaginated; backend caps exist at 100 for a few endpoints. Server-side pagination is a mechanical but wide-reaching follow-up.
7. **Email delivery failure alerts** — failures land in `email_logs` (visible in the UI); an alerting hook (e.g. admin notification) is future work.
8. **QR scanning in automated tests** — the mobile attendance flow was verified end-to-end at the API level (OTP + mark) because headless browsers have no camera; the scanner UI is exercised manually.
9. **Speculative concerns not acted on** (no evidence of live impact): Sanctum `SANCTUM_STATEFUL_DOMAINS` must include the production SPA origin on deploy; `SESSION_SECURE_COOKIE` should be enabled behind HTTPS; `/secure-migrate` and `/clear-cache` should move to POST + header auth for hardened deployments.
