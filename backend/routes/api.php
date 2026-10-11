<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\PendingLoginController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RegisterController;

use App\Http\Controllers\User\ProfileController;

use App\Http\Controllers\Admin\UserApprovalController;
use App\Http\Controllers\Admin\StudentAdminController;
use App\Http\Controllers\Admin\GenerateStudentLoginController;

use App\Http\Controllers\Admin\StudentListController;
use App\Http\Controllers\Admin\StudentViewController;
use App\Http\Controllers\Admin\StudentUpdateController;
use App\Http\Controllers\Admin\StudentDeleteController;

use App\Http\Controllers\Admin\StudentIdCardListController;
use App\Http\Controllers\Admin\StudentIdCardActivateController;
use App\Http\Controllers\Admin\StudentIdCardPdfController;

use App\Http\Controllers\Admin\EnrollmentCenterController;
use App\Http\Controllers\Admin\StudentDocumentController;
use App\Http\Controllers\Admin\StudentDocumentVerificationController;
use App\Http\Controllers\Admin\EnrollmentPaymentController;

use App\Http\Controllers\Admin\AttendanceSessionController;
use App\Http\Controllers\Attendance\AttendanceOtpController;
use App\Http\Controllers\Attendance\AttendanceOtpVerifyController;
use App\Http\Controllers\Attendance\MarkAttendanceController;

use App\Http\Controllers\Admin\AdminCourseController;
use App\Http\Controllers\Admin\AdminBatchController;

use App\Http\Controllers\Admin\StudyMaterialController;
use App\Http\Controllers\Admin\StudyMaterialAccessController;

use App\Http\Controllers\Admin\OnlineClassController;
use App\Http\Controllers\Admin\OnlineClassAccessController;

use App\Http\Controllers\Admin\CourseCertificateController;
use App\Http\Controllers\Admin\CourseCertificatePdfController;

use App\Http\Controllers\Admin\AdminAssignmentController;
use App\Http\Controllers\Admin\AdminAssignmentFileController;
use App\Http\Controllers\Admin\AdminAssignmentSubmissionController;

use App\Http\Controllers\Admin\AdminAdmitCardController;

use App\Http\Controllers\Admin\AdminExamController;
use App\Http\Controllers\Admin\AdminExamResultController;
use App\Http\Controllers\Admin\AdminCertificateIssueController;
use App\Http\Controllers\CertificateVerifyController;

use App\Http\Controllers\Admin\AdminFranchiseController;
use App\Http\Controllers\Admin\AdminFacultyController;
use App\Http\Controllers\Admin\FacultyCreateController;
use App\Http\Controllers\Admin\AdminFacultyAssignmentController;

use App\Http\Controllers\Admin\AdminStudentFeeController;
use App\Http\Controllers\Admin\AdminFranchisePaymentController;
use App\Http\Controllers\Admin\AdminFacultyPayoutController;
use App\Http\Controllers\Admin\AdminExternalPaymentController;

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCommunicationController;

use App\Http\Controllers\Admin\AdminStudentCommunicationController;
use App\Http\Controllers\Admin\AdminStudentCommunicationAccessController;

use App\Http\Controllers\Admin\CorporateRoleController;
use App\Http\Controllers\Admin\CorporateEmployeeController;
use App\Http\Controllers\Admin\CorporateCertificateController;
use App\Http\Controllers\Admin\CorporateCertificatePdfController;
use App\Http\Controllers\Admin\CorporateAnnouncementController;

use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| Student Dashboard
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\Student\StudentEnrollmentController;

use App\Http\Controllers\Student\StudentStudyMaterialController;
use App\Http\Controllers\Student\StudentOnlineClassController;
use App\Http\Controllers\Student\StudentCourseController;
use App\Http\Controllers\Student\StudentIdCardController;
use App\Http\Controllers\Student\StudentAttendanceController;

use App\Http\Controllers\Student\StudentExamController;
use App\Http\Controllers\Student\StudentAdmitCardController;
use App\Http\Controllers\Student\StudentExamResultController;
use App\Http\Controllers\Student\StudentCertificateController;

use App\Http\Controllers\Student\StudentAssignmentController;
use App\Http\Controllers\Student\StudentAssignmentSubmissionController;
use App\Http\Controllers\Student\StudentAssignmentFileController;

use App\Http\Controllers\Student\StudentPaymentController;
use App\Http\Controllers\Student\StudentPaymentProofController;
use App\Http\Controllers\Student\StudentTrackFeesController;
use App\Http\Controllers\Student\StudentPaymentHistoryController;

use App\Http\Controllers\Student\StudentCommunicationController;

/*
|--------------------------------------------------------------------------
| Faculty Dashboard
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Faculty\FacultyMyCourseController;
use App\Http\Controllers\Faculty\FacultyStudentController;

use App\Http\Controllers\Faculty\FacultyStudyMaterialController;
use App\Http\Controllers\Faculty\FacultyStudyMaterialAccessController;

use App\Http\Controllers\Faculty\FacultyOnlineClassController;
use App\Http\Controllers\Faculty\FacultyOnlineClassAccessController;

use App\Http\Controllers\Faculty\FacultyAttendanceSessionController;

use App\Http\Controllers\Faculty\FacultyAssignmentController;
use App\Http\Controllers\Faculty\FacultyAssignmentSubmissionController;
use App\Http\Controllers\Faculty\FacultyAssignmentFileController;
use App\Http\Controllers\Faculty\FacultyExamController;
use App\Http\Controllers\Faculty\FacultyAdmitCardController;
use App\Http\Controllers\Faculty\FacultyExamResultController;

use App\Http\Controllers\Faculty\FacultyCertificateIssueController;

use App\Http\Controllers\Faculty\FacultyStudentCommunicationController;
use App\Http\Controllers\Faculty\FacultyStudentCommunicationAccessController;

use App\Http\Controllers\Faculty\FacultyBatchController;
use App\Http\Controllers\Faculty\FacultyOptionController;
use App\Http\Controllers\Faculty\FacultyMyPayoutController;

/*
|--------------------------------------------------------------------------
| Franchise Dashboard
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Franchise\FranchiseDashboardController;
use App\Http\Controllers\Franchise\FranchiseStudentController;
use App\Http\Controllers\Franchise\FranchisePaymentController;
use App\Http\Controllers\Franchise\FranchiseFacultyController;
use App\Http\Controllers\Franchise\FranchiseEnrollmentController;
use App\Http\Controllers\Franchise\FranchiseCourseController;
use App\Http\Controllers\Franchise\FranchiseAnnouncementController;

/*
|--------------------------------------------------------------------------
| Employee Dashboard
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Employee\EmployeeDashboardController;
use App\Http\Controllers\Employee\EmployeeAnnouncementController;
use App\Http\Controllers\Employee\EmployeeDirectoryController;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

Route::get('/unauthenticated', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

/*
|--------------------------------------------------------------------------
| Protected API routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | Shared assignment-submission file serving (admin / faculty / student)
    |--------------------------------------------------------------------------
    | The controller itself verifies the caller's role against the submission
    | (owner, assigned faculty, or admin), so no route-level role gate.
    */
    Route::get('/assignments/submissions/file/{path}', [StudentAssignmentFileController::class, 'view'])
        ->where('path', '.*');

    /*
    |--------------------------------------------------------------------------
    | Local QR generation (keeps tokens off third-party QR services)
    |--------------------------------------------------------------------------
    */
    Route::get('/qr', function (Request $request) {
        $data = (string) $request->query('data', '');
        abort_if($data === '' || strlen($data) > 512, 422, 'Missing QR payload.');

        return response(
            app(\App\Services\QrCodeService::class)->png($data),
            200,
            ['Content-Type' => 'image/png']
        );
    });

    // ================= Manage Profile =================
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/user/send-otp', [ProfileController::class, 'sendOtp'])->middleware('throttle:10,1');
    Route::post('/user/verify-otp-password', [ProfileController::class, 'verifyOtpPassword'])->middleware('throttle:10,1');

    /*
    |--------------------------------------------------------------------------
    | Admin routes (role: admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:admin', 'approved'])->group(function () {

    // ================= Dashboard =================
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);

    // ================= Users / Students =================
    Route::post('/admin/users/{id}/approve', [UserApprovalController::class, 'approve']);

    Route::post('/admin/students', [StudentAdminController::class, 'store']);
    Route::post('/admin/students/{userId}/generate-login', [GenerateStudentLoginController::class, 'generate']);

    Route::get('/admin/students', [StudentListController::class, 'index']);
    Route::get('/admin/students/{id}', [StudentViewController::class, 'show']);
    Route::put('/admin/students/{id}', [StudentUpdateController::class, 'update']);
    Route::delete('/admin/students/{id}', [StudentDeleteController::class, 'destroy']);
    
    Route::get('/admin/enrollments', [EnrollmentCenterController::class, 'index']);
    Route::get('/admin/enrollments/{id}', [EnrollmentCenterController::class, 'show']);
    Route::post('/admin/enrollments/{id}/approve', [EnrollmentCenterController::class, 'approve']);
    Route::post('/admin/enrollments/{id}/reject', [EnrollmentCenterController::class, 'reject']);
    Route::post('/admin/enrollments/{id}/complete', [EnrollmentCenterController::class, 'complete']);
    Route::post('/admin/student-documents/admin-override', [StudentDocumentVerificationController::class, 'adminOverride']);
    Route::post('/admin/enrollments', [EnrollmentCenterController::class, 'store']);
    
    Route::get('/admin/students/{studentId}/documents', [StudentDocumentController::class, 'index']);
    Route::post('/admin/students/{studentId}/documents', [StudentDocumentController::class, 'upload']);
    Route::get('/admin/student-documents/{documentId}/view', [StudentDocumentController::class, 'view']);
    
    Route::post('/admin/student-documents/{documentId}/verify', [StudentDocumentVerificationController::class, 'verify']);
    Route::post('/admin/student-documents/{documentId}/reject', [StudentDocumentVerificationController::class, 'reject']);
    
    Route::post('/admin/enrollments/{id}/mark-paid', [EnrollmentPaymentController::class, 'markPaid']);

    // ================= Student ID Cards =================
    Route::get('/admin/student-id-cards', [StudentIdCardListController::class, 'index']);
    Route::post('/admin/student-id-cards/{studentId}/activate', [StudentIdCardActivateController::class, 'activate']);

    // ================= Attendance =================
    Route::post('/admin/attendance/sessions/start', [AttendanceSessionController::class, 'start']);
    Route::post('/admin/attendance/sessions/end', [AttendanceSessionController::class, 'end']);
    Route::get('/admin/attendance/report', [AttendanceSessionController::class, 'report']);

    // ================= Courses & Batches =================
    Route::get('/admin/courses', [AdminCourseController::class, 'index']);
    Route::post('/admin/courses', [AdminCourseController::class, 'store']);
    Route::put('/admin/courses/{id}', [AdminCourseController::class, 'update']);
    Route::patch('/admin/courses/{id}/toggle', [AdminCourseController::class, 'toggle']);
    Route::delete('/admin/courses/{id}', [AdminCourseController::class, 'destroy']);

    Route::get('/admin/courses/{courseId}/batches', [AdminBatchController::class, 'listByCourse']);
    Route::post('/admin/batches', [AdminBatchController::class, 'store']);
    Route::put('/admin/batches/{id}', [AdminBatchController::class, 'update']);
    Route::patch('/admin/batches/{id}/toggle', [AdminBatchController::class, 'toggle']);
    Route::delete('/admin/batches/{id}', [AdminBatchController::class, 'destroy']);

    // ================= Study Materials =================
    Route::get('/admin/study-materials', [StudyMaterialController::class, 'index']);
    Route::post('/admin/study-materials', [StudyMaterialController::class, 'store']);
    Route::put('/admin/study-materials/{id}', [StudyMaterialController::class, 'update']);
    Route::delete('/admin/study-materials/{id}', [StudyMaterialController::class, 'destroy']);
    Route::patch('/admin/study-materials/{id}/toggle', [StudyMaterialController::class, 'toggle']);

    Route::post('/admin/study-materials/{id}/access', [StudyMaterialAccessController::class, 'store']);
    Route::get('/admin/study-materials/{id}/access', [StudyMaterialAccessController::class, 'show']);
    
    Route::get('/admin/study-materials/{id}/view', [StudyMaterialController::class, 'view']);

    // ================= Online Classes =================
    Route::get('/admin/online-classes', [OnlineClassController::class, 'index']);
    Route::post('/admin/online-classes', [OnlineClassController::class, 'store']);
    Route::put('/admin/online-classes/{id}', [OnlineClassController::class, 'update']);
    Route::delete('/admin/online-classes/{id}', [OnlineClassController::class, 'destroy']);
    Route::post('/admin/online-classes/{id}/go-live', [OnlineClassController::class, 'goLive']);

    Route::get('/admin/online-classes/{id}/access', [OnlineClassAccessController::class, 'show']);
    Route::post('/admin/online-classes/{id}/access', [OnlineClassAccessController::class, 'store']);

    // ================= Admin Exams =================
    Route::get('/admin/exams', [AdminExamController::class, 'index']);
    Route::post('/admin/exams', [AdminExamController::class, 'store']);
    Route::put('/admin/exams/{exam}', [AdminExamController::class, 'update']);
    Route::put('/admin/exams/{exam}/postpone', [AdminExamController::class, 'postpone']);
    Route::put('/admin/exams/{exam}/cancel', [AdminExamController::class, 'cancel']);
    
    // ================= Assignments =================
    Route::get('/admin/assignments', [AdminAssignmentController::class, 'index']);
    Route::post('/admin/assignments', [AdminAssignmentController::class, 'store']);
    Route::get('/admin/assignments/{id}', [AdminAssignmentController::class, 'show']);
    Route::post('/admin/assignments/upload-file', [AdminAssignmentFileController::class, 'upload']);
    Route::get('/admin/assignments/{id}/file', [AdminAssignmentFileController::class, 'view']);
    Route::get('/admin/assignments/{assignmentId}/submissions', [AdminAssignmentSubmissionController::class, 'index']);

    // ================= Admit Cards (Admin) =================
    Route::get('/admin/admit-cards/exams', [AdminAdmitCardController::class, 'exams']);
    Route::get('/admin/admit-cards/{exam}/students', [AdminAdmitCardController::class, 'students']);
    Route::post('/admin/admit-cards/{exam}/{student}', [AdminAdmitCardController::class, 'generate']);
    Route::get('/admin/admit-card/{admitCard}', [AdminAdmitCardController::class, 'view']);

    // ================= Results & Certificates =================
    Route::get('/admin/exam-results', [AdminExamResultController::class, 'index']);
    Route::post('/admin/exam-results/save', [AdminExamResultController::class, 'save']);

    Route::get('/admin/certificates', [AdminCertificateIssueController::class, 'index']);
    Route::post('/admin/certificates/{certificate}/issue', [AdminCertificateIssueController::class, 'issue']);
    
    // ================= Franchises =================
    Route::get('/franchises', [AdminFranchiseController::class, 'index']);
    Route::post('/franchises', [AdminFranchiseController::class, 'store']);
    Route::put('/franchises/{id}', [AdminFranchiseController::class, 'update']);
    Route::patch('/franchises/{id}/toggle', [AdminFranchiseController::class, 'toggle']);
    Route::delete('/franchises/{id}', [AdminFranchiseController::class, 'destroy']);
    
    // ================= Faculty =================
    Route::get('/faculties', [AdminFacultyController::class, 'index']);
    Route::post('/faculties', [FacultyCreateController::class, 'store']);
    Route::put('/faculties/{id}', [AdminFacultyController::class, 'update']);
    Route::delete('/faculties/{id}', [AdminFacultyController::class, 'destroy']);
    
    // ================= Faculty Assignments =================
    Route::get('/faculty-assignments/faculties', [AdminFacultyAssignmentController::class, 'faculties']);
    Route::get('/faculty-assignments/courses', [AdminFacultyAssignmentController::class, 'courses']);
    Route::get('/faculty-assignments/courses/{courseId}/batches', [AdminFacultyAssignmentController::class, 'batches']);
    Route::get('/faculty-assignments/{facultyId}', [AdminFacultyAssignmentController::class, 'assignments']);
    Route::post('/faculty-assignments', [AdminFacultyAssignmentController::class, 'store']);
    Route::delete('/faculty-assignments/{assignmentId}', [AdminFacultyAssignmentController::class, 'destroy']);
        
    // ================= Payments =================
    Route::get('/student-fees', [AdminStudentFeeController::class, 'index']);
    Route::post('/student-fees/{studentId}', [AdminStudentFeeController::class, 'update']);
    
    Route::get('/franchise-payments', [AdminFranchisePaymentController::class, 'index']);
    Route::post('/franchise-payments/{id}', [AdminFranchisePaymentController::class, 'update']);
    Route::post('/franchise-commission', [AdminFranchisePaymentController::class, 'updateCommission']);
    
    Route::get('/faculty-payouts', [AdminFacultyPayoutController::class, 'index']);
    Route::post('/faculty-payouts/{id}/salary', [AdminFacultyPayoutController::class, 'updateSalary']);
    Route::post('/faculty-payouts/{id}/pay', [AdminFacultyPayoutController::class, 'markPaid']);
    Route::get('/faculty-payouts/{id}/history', [AdminFacultyPayoutController::class, 'history']);
    
    Route::get('/external-payments', [AdminExternalPaymentController::class, 'index']);
    
    // ================= USER ACCESS CONTROL =================
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::get('/admin/users/pending', [AdminUserController::class, 'pending']);
    
    Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    
    Route::post('/admin/users/{id}/reset', [AdminUserController::class, 'resetCredentials']);
    
    // ================= COMMUNICATION AND ALERTS =================
    Route::get('/admin/communication/users', [AdminCommunicationController::class, 'users']);
    Route::post('/admin/communication/send', [AdminCommunicationController::class, 'send']);
    Route::get('/admin/communication/logs', [AdminCommunicationController::class, 'logs']);
    Route::get('/admin/communication/logs/{id}', [AdminCommunicationController::class, 'show']);
    
    Route::get('/admin/student-communications', [AdminStudentCommunicationController::class, 'index']);
    Route::post('/admin/student-communications', [AdminStudentCommunicationController::class, 'store']);
    Route::put('/admin/student-communications/{id}', [AdminStudentCommunicationController::class, 'update']);
    Route::patch('/admin/student-communications/{id}/toggle', [AdminStudentCommunicationController::class, 'toggle']);
    Route::delete('/admin/student-communications/{id}', [AdminStudentCommunicationController::class, 'destroy']);
    
    Route::get('/admin/student-communications/{id}/access', [AdminStudentCommunicationAccessController::class, 'show']);
    Route::post('/admin/student-communications/{id}/access', [AdminStudentCommunicationAccessController::class, 'store']);
        
    // ================= CORPORATE MANAGEMENT =================
    Route::prefix('corporate')->group(function () {
    
        Route::get('/roles', [CorporateRoleController::class, 'index']);
        Route::post('/roles', [CorporateRoleController::class, 'store']);
        Route::put('/roles/{id}', [CorporateRoleController::class, 'update']);
        Route::delete('/roles/{id}', [CorporateRoleController::class, 'destroy']);
    
        Route::get('/employees', [CorporateEmployeeController::class, 'index']);
        Route::post('/employees', [CorporateEmployeeController::class, 'store']);
        Route::put('/employees/{id}', [CorporateEmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [CorporateEmployeeController::class, 'destroy']);
    
        Route::get('/certificates', [CorporateCertificateController::class, 'index']);
        Route::post('/certificates', [CorporateCertificateController::class, 'store']);

        Route::get('/announcements', [CorporateAnnouncementController::class, 'index']);
        Route::post('/announcements', [CorporateAnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [CorporateAnnouncementController::class, 'update']);
        Route::patch('/announcements/{id}/toggle', [CorporateAnnouncementController::class, 'toggle']);
        Route::delete('/announcements/{id}', [CorporateAnnouncementController::class, 'destroy']);
    
    });
    
    }); // end admin routes

    /*
    |--------------------------------------------------------------------------
    | Student dashboard (role: student)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:student', 'approved'])->group(function () {

    Route::get('/student/dashboard', [StudentDashboardController::class, 'index']);
    Route::get('/student/enrollments/available-courses', [StudentEnrollmentController::class, 'availableCourses']);
    Route::post('/student/enrollments', [StudentEnrollmentController::class, 'store']);
    
    Route::get('/student/my-courses', [StudentCourseController::class, 'index']);
    Route::get('/student/my-courses/{id}', [StudentCourseController::class, 'show']);
    
    Route::get('/student/study-materials', [StudentStudyMaterialController::class, 'index']);
    Route::get('/student/study-materials/{id}/view', [StudyMaterialController::class, 'studentView']);
    
    Route::get('/student/online-classes', [StudentOnlineClassController::class, 'index']);
    Route::get('/student/online-classes/{id}', [StudentOnlineClassController::class, 'show']);
    
    Route::get('/student/id-card', [StudentIdCardController::class, 'show']);
    
    Route::get('/student/attendance/live', [StudentAttendanceController::class, 'live']);
    Route::get('/student/attendance/enrollments', [StudentAttendanceController::class, 'enrollments']);
    Route::get('/student/attendance/history', [StudentAttendanceController::class, 'history']);
    
    Route::get('/student/exams', [StudentExamController::class, 'index']);
    Route::get('/student/exams/{id}', [StudentExamController::class, 'show']);
    
    Route::get('/student/assignments', [StudentAssignmentController::class, 'index']);
    Route::get('/student/assignments/{id}', [StudentAssignmentController::class, 'show']);
    Route::get('/student/assignments/{id}/attachment', [StudentAssignmentController::class, 'attachment']);
    Route::post('/student/assignments/upload-file', [StudentAssignmentFileController::class, 'upload']);
    Route::post('/student/assignments/{assignmentId}/submit', [StudentAssignmentSubmissionController::class, 'submit']);
    Route::get('/student/assignments/file/{path}', [StudentAssignmentFileController::class, 'view'])->where('path', '.*');
        
    Route::get('/student/admit-cards', [StudentAdmitCardController::class, 'index']);
    Route::get('/student/admit-cards/{admitCard}', [StudentAdmitCardController::class, 'show']);
    
    Route::get('/student/results/enrollments', [StudentExamResultController::class, 'enrollments']);
    Route::get('/student/results/{courseId}/{batchId}', [StudentExamResultController::class, 'results']);
    
    Route::get('/student/certificates/enrollments', [StudentCertificateController::class, 'enrollments']);
    Route::get('/student/certificates/{courseId}/{batchId}', [StudentCertificateController::class, 'index']);
    
    Route::get('/student/payments/enrollments', [StudentPaymentController::class, 'enrollments']);
    Route::get('/student/payment-proofs', [StudentPaymentProofController::class, 'index']);
    Route::post('/student/payment-proofs/{enrollmentId}/upload', [StudentPaymentProofController::class, 'upload']);
    Route::get('/student/track-fees', [StudentTrackFeesController::class, 'index']);
    Route::get('/student/payment-history', [StudentPaymentHistoryController::class, 'index']);
    
    Route::get('/student/communication', [StudentCommunicationController::class, 'index']);
    
    }); // end student routes

    /*
    |--------------------------------------------------------------------------
    | Faculty dashboard (role: faculty)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:faculty', 'approved'])->group(function () {

    Route::get('/faculty/courses', [FacultyMyCourseController::class, 'index']);
    Route::get('/faculty/students', [FacultyStudentController::class, 'index']);
    
    Route::get('/faculty/study-materials', [FacultyStudyMaterialController::class, 'index']);
    Route::post('/faculty/study-materials', [FacultyStudyMaterialController::class, 'store']);
    Route::put('/faculty/study-materials/{id}', [FacultyStudyMaterialController::class, 'update']);
    Route::patch('/faculty/study-materials/{id}/toggle', [FacultyStudyMaterialController::class, 'toggle']);
    Route::delete('/faculty/study-materials/{id}', [FacultyStudyMaterialController::class, 'destroy']);
    Route::get('/faculty/study-materials/{id}/view', [FacultyStudyMaterialController::class, 'view']);
    
    Route::get('/faculty/study-materials/{id}/access', [FacultyStudyMaterialAccessController::class, 'show']);
    Route::post('/faculty/study-materials/{id}/access', [FacultyStudyMaterialAccessController::class, 'store']);
    
    Route::get('/faculty/online-classes', [FacultyOnlineClassController::class, 'index']);
    Route::post('/faculty/online-classes', [FacultyOnlineClassController::class, 'store']);
    Route::put('/faculty/online-classes/{id}', [FacultyOnlineClassController::class, 'update']);
    Route::delete('/faculty/online-classes/{id}', [FacultyOnlineClassController::class, 'destroy']);
    Route::post('/faculty/online-classes/{id}/go-live', [FacultyOnlineClassController::class, 'goLive']);
    
    Route::get('/faculty/online-classes/{id}/access', [FacultyOnlineClassAccessController::class, 'show']);
    Route::post('/faculty/online-classes/{id}/access', [FacultyOnlineClassAccessController::class, 'store']);
    
    Route::post('/faculty/attendance/sessions/start', [FacultyAttendanceSessionController::class, 'start']);
    Route::post('/faculty/attendance/sessions/end', [FacultyAttendanceSessionController::class, 'end']);
    Route::get('/faculty/attendance/report', [FacultyAttendanceSessionController::class, 'report']);
    
    Route::get('/faculty/assignments', [FacultyAssignmentController::class, 'index']);
    Route::post('/faculty/assignments', [FacultyAssignmentController::class, 'store']);
    Route::get('/faculty/assignments/{id}', [FacultyAssignmentController::class, 'show']);
    
    Route::post('/faculty/assignments/upload-file', [FacultyAssignmentFileController::class, 'upload']);
    Route::get('/faculty/assignments/{id}/file', [FacultyAssignmentFileController::class, 'view']);
    Route::get('/faculty/assignments/{assignmentId}/submissions', [FacultyAssignmentSubmissionController::class, 'index']);

    Route::get('/faculty/exams', [FacultyExamController::class, 'index']);
    Route::post('/faculty/exams', [FacultyExamController::class, 'store']);
    Route::put('/faculty/exams/{exam}', [FacultyExamController::class, 'update']);
    Route::put('/faculty/exams/{exam}/postpone', [FacultyExamController::class, 'postpone']);
    Route::put('/faculty/exams/{exam}/cancel', [FacultyExamController::class, 'cancel']);
    
    Route::get('/faculty/admit-cards/exams', [FacultyAdmitCardController::class, 'exams']);
    Route::get('/faculty/admit-cards/{exam}/students', [FacultyAdmitCardController::class, 'students']);
    Route::post('/faculty/admit-cards/{exam}/{student}', [FacultyAdmitCardController::class, 'generate']);
    Route::get('/faculty/admit-card/{admitCard}', [FacultyAdmitCardController::class, 'view']);
    Route::get('/faculty/exam-results', [FacultyExamResultController::class, 'index']);
    Route::post('/faculty/exam-results/save', [FacultyExamResultController::class, 'save']);
    
    Route::get('/faculty/certificates', [FacultyCertificateIssueController::class, 'index']);
    Route::post('/faculty/certificates/{certificate}/issue', [FacultyCertificateIssueController::class, 'issue']);
    
    Route::get('/faculty/student-communications', [FacultyStudentCommunicationController::class, 'index']);
    Route::post('/faculty/student-communications', [FacultyStudentCommunicationController::class, 'store']);
    Route::put('/faculty/student-communications/{id}', [FacultyStudentCommunicationController::class, 'update']);
    Route::patch('/faculty/student-communications/{id}/toggle', [FacultyStudentCommunicationController::class, 'toggle']);
    Route::delete('/faculty/student-communications/{id}', [FacultyStudentCommunicationController::class, 'destroy']);
    Route::get('/faculty/student-communications/{id}/access', [FacultyStudentCommunicationAccessController::class, 'show']);
    Route::post('/faculty/student-communications/{id}/access', [FacultyStudentCommunicationAccessController::class, 'store']);
    
    //Route::get('/faculty/attendance/report', [FacultyAttendanceSessionController::class, 'report']);

    Route::get('/faculty/courses/{courseId}/batches', [FacultyBatchController::class, 'listByCourse']);
    
    Route::get('/faculty/course-options', [FacultyOptionController::class, 'courses']);
    Route::get('/faculty/course-options/{course}/batches', [FacultyOptionController::class, 'batches']);

    Route::get('/faculty/payouts', [FacultyMyPayoutController::class, 'index']);

    }); // end faculty routes

    /*
    |--------------------------------------------------------------------------
    | Franchise dashboard (role: franchise)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:franchise', 'approved'])->group(function () {

        Route::get('/franchise/dashboard', [FranchiseDashboardController::class, 'index']);

        Route::get('/franchise/students', [FranchiseStudentController::class, 'index']);
        Route::get('/franchise/enrollments', [FranchiseEnrollmentController::class, 'index']);
        Route::get('/franchise/courses', [FranchiseCourseController::class, 'index']);
        Route::get('/franchise/announcements', [FranchiseAnnouncementController::class, 'index']);

        Route::get('/franchise/payments', [FranchisePaymentController::class, 'index']);
        Route::get('/franchise/commission', [FranchisePaymentController::class, 'commission']);
        Route::get('/franchise/revenue-report', [FranchisePaymentController::class, 'revenueReport']);

        Route::get('/franchise/faculty', [FranchiseFacultyController::class, 'index']);

    }); // end franchise routes

    /*
    |--------------------------------------------------------------------------
    | Employee dashboard (role: employee)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:employee', 'approved'])->group(function () {

        Route::get('/employee/dashboard', [EmployeeDashboardController::class, 'index']);
        Route::get('/employee/announcements', [EmployeeAnnouncementController::class, 'index']);
        Route::get('/employee/directory', [EmployeeDirectoryController::class, 'index']);

    }); // end employee routes

});

/*
|--------------------------------------------------------------------------
| PUBLIC PDF ROUTE (iframe-safe, NO sanctum)
|--------------------------------------------------------------------------
*/

Route::get('/id-card/{token}/view', [StudentIdCardPdfController::class, 'view']);
Route::get('/id-card/{token}/download', [StudentIdCardPdfController::class, 'download']);

Route::get('/certificate/{certificateNumber}', [CourseCertificatePdfController::class, 'view']);

Route::get(
    '/admit-card/{admitCard}/pdf',
    [AdminAdmitCardController::class, 'pdf']
)->middleware('auth:sanctum')->name('admit-card.pdf');

Route::get(
    '/admit-card/token/{token}/pdf',
    [AdminAdmitCardController::class, 'pdfByToken']
)->name('admit-card.token-pdf');

Route::get('/corporate-certificate/{certificateNumber}/view', [CorporateCertificatePdfController::class, 'view'])->where('certificateNumber', '[A-Za-z0-9\-]+');
Route::get('/corporate-certificate/{certificateNumber}/download', [CorporateCertificatePdfController::class, 'download'])->where('certificateNumber', '[A-Za-z0-9\-]+');

/*
|--------------------------------------------------------------------------
| Public / Utility Routes
|--------------------------------------------------------------------------
*/

Route::post('/attendance/send-otp', [AttendanceOtpController::class, 'send'])->middleware('throttle:5,1');
Route::post('/attendance/verify-otp', [AttendanceOtpVerifyController::class, 'verify'])->middleware('throttle:10,1');
Route::post('/attendance/mark', [MarkAttendanceController::class, 'mark'])->middleware('throttle:30,1');

Route::get('/certificate-verify/{certificateId}', [CertificateVerifyController::class, 'verify']);


/*
|--------------------------------------------------------------------------
| Authentication Flow
|--------------------------------------------------------------------------
*/
Route::group([], function () {

    Route::post('/login-check', [PendingLoginController::class, 'checkCredentials'])->middleware('throttle:20,1');
    Route::post('/login-complete', [PendingLoginController::class, 'completeLogin'])->middleware('throttle:20,1');
    Route::post('/login-cancel', [PendingLoginController::class, 'cancelPendingLogin'])->middleware('throttle:20,1');
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

    Route::post('/send-otp', [OtpController::class, 'sendOtp'])->middleware('throttle:30,1');
    Route::post('/verify-otp', [OtpController::class, 'verifyOtp'])->middleware('throttle:30,1');

    Route::post('/password/forgot-start', [PasswordResetController::class, 'start'])->middleware('throttle:10,1');
    Route::post('/password/forgot-security', [PasswordResetController::class, 'checkSecurity'])->middleware('throttle:10,1');
    Route::post('/password/forgot-verify', [PasswordResetController::class, 'verify'])->middleware('throttle:10,1');
    Route::post('/password/reset', [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');

    Route::post('/register/start', [RegisterController::class, 'start'])->middleware('throttle:10,1');
    Route::post('/register/verify', [RegisterController::class, 'verify'])->middleware('throttle:10,1');
    Route::post('/register/complete', [RegisterController::class, 'complete'])->middleware('throttle:10,1');
});

/*
|--------------------------------------------------------------------------
| Operational utility routes (secret-gated, for hosted deploys)
|--------------------------------------------------------------------------
*/

Route::get('/secure-migrate', function (Request $request) {

    $secret = (string) config('app.migration_secret');

    if ($secret === '' || ! $request->has('key') || ! hash_equals($secret, (string) $request->query('key'))) {
        abort(403, 'Unauthorized');
    }

    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('optimize:clear');

    return 'Migrations done and cache cleared.';
});

Route::get('/clear-cache', function (Request $request) {

    $secret = (string) config('app.migration_secret');

    if ($secret === '' || ! $request->has('key') || ! hash_equals($secret, (string) $request->query('key'))) {
        abort(403, 'Unauthorized');
    }

    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('optimize:clear');

    return 'Config, cache, and optimization cleared successfully.';
});
