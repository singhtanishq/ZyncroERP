<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Payment;
use App\Models\Franchise;
use App\Models\Certificate;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\AdmitCard;
use App\Models\ExamResult;
use App\Models\OnlineClass;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        /* ===================== BASIC STATS ===================== */

        $totalStudents = Student::count();
        $totalFaculties = Faculty::count();
        $totalCourses = Course::count();
        $totalBatches = Batch::count();
        $totalCertificates = Certificate::count();

        $totalRevenue = Payment::where('status', 'success')->sum('amount');
        $pendingPayments = Payment::where('status', 'pending')->count();

        $activeFranchises = Franchise::where('status', 'active')->count();

        /* ===================== EXAM STATS ===================== */

        $totalExams = Exam::count();
        $totalAdmitCards = AdmitCard::count();
        $totalResults = ExamResult::count();

        /* ===================== CLASS STATS ===================== */

        $upcomingClasses = OnlineClass::where('start_datetime', '>', now())->count();

        $liveClasses = OnlineClass::where('start_datetime', '<=', now())
            ->where('end_datetime', '>=', now())
            ->count();

        $completedClasses = OnlineClass::where('end_datetime', '<', now())->count();

        /* ===================== CHARTS ===================== */

        // Grouped by year+month so the same month across different years
        // no longer merges into one bucket.
        $revenueChart = Payment::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(amount) as total")
            )
            ->where('status', 'success')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $studentChart = Student::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("COUNT(*) as total")
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        /* ===================== RECENT ===================== */

        $recentStudents = Student::with('user') 
            ->latest()
            ->take(5)
            ->get();

        $recentPayments = Payment::latest()->take(5)->get();
        $recentUsers = User::latest()->take(5)->get();

        /* ===================== ALERTS ===================== */

        $pendingUsers = User::where('approve_status', 0)->count();
        $failedEmails = DB::table('email_logs')->where('status', false)->count();

        /* ===================== RESPONSE ===================== */

        return response()->json([
            'stats' => [
                'students' => $totalStudents,
                'faculties' => $totalFaculties,
                'courses' => $totalCourses,
                'batches' => $totalBatches,
                'certificates' => $totalCertificates,

                'revenue' => $totalRevenue,
                'pending_payments' => $pendingPayments,
                'franchises' => $activeFranchises,

                'exams' => $totalExams,
                'admit_cards' => $totalAdmitCards,
                'results' => $totalResults,

                'upcoming_classes' => $upcomingClasses,
                'live_classes' => $liveClasses,
                'completed_classes' => $completedClasses,
            ],

            'charts' => [
                'revenue' => $revenueChart,
                'students' => $studentChart,
            ],

            'recent' => [
                'students' => $recentStudents,
                'payments' => $recentPayments,
                'users' => $recentUsers,
            ],

            'alerts' => [
                'pending_users' => $pendingUsers,
                'failed_emails' => $failedEmails,
            ]
        ]);
    }
}