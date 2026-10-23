# Zyncro ERP — Screenshot Coverage Catalog

Authoritative ledger of the visual documentation: **190 screenshots** captured from the
running application with Playwright (Chrome, 1440×900 @2x desktop; 390×844 for the
mobile shot), after all audit fixes were applied. Every screenshot below is embedded in
the root `README.md` at the section noted in the last column.

Counting method: a "state" is one screenshot; a page with N captured states counts N
times here. Unique image files = 190. Deliberate exclusions are listed at the end.

| Directory | # | Contents |
|---|---|---|
| `shared/authentication/` | 15 | login (light), 2-step security check, OTP modal, register page, register details filled, register OTP modal, register info stage, register confirm stage, register success, pending approval, forgot-password entry, forgot-password email, forgot-password security, login light/dark pair |
| `shared/global-components/` | 3 | admin dashboard dark mode, student list dark mode, admin mobile viewport (390×844) |
| `public/mobile-attendance/` | 2 | mobile attendance email step, OTP step |
| `admin/dashboard/` | 2 | dashboard top (KPIs + charts), dashboard bottom (activity lists) |
| `admin/student-management/add-student/` | 5 | stage 1 empty, stage 1 filled, stage 2 preview, stage 3 confirm, success |
| `admin/student-management/student-list/` | 5 | default list, search active, view modal, edit modal, delete confirmation |
| `admin/student-management/enrollment-center/` | 8 | center top, center bottom, drawer with proof, proof verified, mark-paid modal, payment recorded, approve confirm, approved |
| `admin/student-management/id-cards/` | 4 | list, activation confirm, activated, public PDF preview |
| `admin/attendance/` | 4 | manage page, start modal, live QR session, start validation error |
| `admin/course-management/courses/` | 4 | add page, manage page, batches expanded, edit modal |
| `admin/course-management/study-materials/` | 3 | manage page, add modal, filled modal (with real PDF attached) |
| `admin/course-management/online-classes/` | 6 | manage page, wizard step 1, filled, platform step, access step, list after create |
| `admin/exam-management/assignments/` | 3 | list, create modal, submissions modal |
| `admin/exam-management/exams/` | 13 | two full 5-stage scheduling runs (basic info, timing, delivery, review, confirm, after-submit) + manage list |
| `admin/exam-management/admit-cards/` | 4 | exam list, student list, generated, PDF preview |
| `admin/exam-management/results/` | 5 | page, matrix, row expanded, scores filled, saved |
| `admin/exam-management/certificates/` | 5 | list, row expanded, issue confirm, issued, failed-cert blocked |
| `admin/franchise-management/` | 3 | add page, manage page, view modal |
| `admin/faculty-management/faculty/` | 2 | add page, manage page |
| `admin/faculty-management/assign-courses/` | 1 | assign page |
| `admin/corporate-management/roles/` | 1 | roles page |
| `admin/corporate-management/employees/` | 2 | add page, manage page |
| `admin/corporate-management/certificates/` | 1 | issue page |
| `admin/corporate-management/announcements/` | 1 | announcements page |
| `admin/payments/manage/` | 1 | payment hub |
| `admin/payments/student-fees/` | 2 | list, expanded fee row |
| `admin/payments/franchise-payments/` | 1 | franchise payments |
| `admin/payments/faculty-payouts/` | 1 | faculty payouts |
| `admin/payments/payment-history/` | 1 | payment history |
| `admin/communication/bulk-emails/` | 2 | send page, compose modal |
| `admin/communication/email-logs/` | 1 | logs page |
| `admin/communication/student-communications/` | 2 | manage page, view modal |
| `admin/user-management/add/` | 1 | add user |
| `admin/user-management/manage/` | 1 | manage users |
| `admin/user-management/pending/` | 4 | page, list with pending user, approve confirm, approved |
| `admin/reports/` | 2 | attendance report, payment analytics |
| `admin/profile/` | 1 | manage profile |
| `student/dashboard/` | 4 | home top, home bottom, enroll course, home with pending enrollment |
| `student/my-learning/my-courses/` | 2 | list, detail modal |
| `student/my-learning/study-materials/` | 1 | materials grid |
| `student/my-learning/online-classes/` | 2 | list, detail modal |
| `student/my-learning/id-card/` | 2 | ID card page, public PDF preview |
| `student/my-learning/attendance/` | 1 | QR attendance page |
| `student/exams/exams/` | 2 | list, detail modal |
| `student/exams/assignments/` | 4 | list, modal, file uploaded, submitted |
| `student/exams/admit-cards/` | 3 | list, view modal, official PDF |
| `student/exams/results/` | 2 | page, results loaded |
| `student/certificates/` | 2 | page, certificate selected |
| `student/payments/upload-proof/` | 3 | page, file selected, uploaded |
| `student/payments/make-payment/` | 1 | page |
| `student/payments/track-fees/` | 1 | page |
| `student/payments/history/` | 1 | page |
| `student/communication/` | 2 | list, view modal |
| `student/profile/` | 1 | manage profile |
| `faculty/dashboard/` | 2 | faculty home, profile |
| `faculty/teaching/` | 3 | my courses, my students, student view modal |
| `faculty/content/` | 3 | study materials, online classes, QR attendance |
| `faculty/assessment/` | 6 | assignments, submissions modal, schedule exam, manage exams, admit cards, results |
| `faculty/certificates/` | 1 | issue certificates |
| `faculty/communication/` | 1 | announcements |
| `faculty/finance/` | 1 | my payouts |
| `faculty/reports/` | 1 | attendance report |
| `franchise/dashboard/` | 1 | franchise home (populated after the scoping fix) |
| `franchise/students/` | 1 | my students |
| `franchise/enrollments/` | 1 | enrollments |
| `franchise/courses/` | 1 | courses |
| `franchise/reports/` | 2 | student reports, revenue analytics |
| `franchise/faculty/` | 1 | faculty |
| `franchise/announcements/` | 1 | announcements |
| `franchise/payments/` | 2 | revenue, commission |
| `employee/dashboard/` | 2 | employee home, account settings |
| `employee/employment/` | 1 | employment profile |
| `employee/certificates/` | 1 | certificates |
| `employee/announcements/` | 1 | announcements |
| `employee/directory/` | 1 | team directory |
| **Total** | **190** | |

## Deliberate exclusions

| Page/state | Reason |
| --- | --- |
| Identical-per-role pages (ManageProfile, login shell) | Captured once per role where content differs (admin/student/faculty profile differ in nav context); the employee account page is captured as the shared-profile example. |
| Loading skeletons | Transient (sub-second); the loading/empty/error patterns are represented by the empty and error states captured. |
| QR camera scan frame on `/attendance` | Headless browser has no camera; the scan → mark path was verified at API level (see `TESTING_REPORT.md` §5). |
| Pagination states | Demo dataset fits on one page for every list; the pagination controls are part of the shared `DataTable` shown in the franchise screenshots. |
| Print dialogs / OS file pickers | Not part of the application UI. |

## Reconciliation notes

- Route inventory vs screenshots: every admin, student, faculty, franchise and employee
  navigation item has at least one capture; secondary states (modals, confirmations,
  wizard stages, PDF previews, validation errors) are captured where meaningful.
- The two exam wizard runs (`01-*` upcoming, `07-*` past) document every stage of the
  5-step process twice because the second run also demonstrates the completed flow with
  different data.
- All image paths in the root README resolve relative to the repository root and were
  validated programmatically (file exists, non-trivial size, correct folder).
