<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FranchiseDashboardController extends Controller
{
    use ResolvesFranchise;

    public function index()
    {
        $franchise = $this->franchise();

        $studentIds = $franchise->students()->pluck('id');

        $totalStudents = $studentIds->count();

        $activeEnrollments = StudentEnrollment::whereIn('student_id', $studentIds)
            ->where('status', 'active')
            ->count();

        $pendingEnrollments = StudentEnrollment::whereIn('student_id', $studentIds)
            ->where('status', 'pending')
            ->count();

        $completedEnrollments = StudentEnrollment::whereIn('student_id', $studentIds)
            ->where('status', 'completed')
            ->count();

        $facultyCount = $franchise->faculties()->count();

        /* Fee collection across this franchise's students. */
        $feeSummary = DB::table('student_fees')
            ->whereIn('student_id', $studentIds)
            ->selectRaw('COALESCE(SUM(total_fees), 0) AS total, COALESCE(SUM(paid_fees), 0) AS paid')
            ->first();

        $commissionRate = (float) (DB::table('franchise_commissions')->value('commission') ?? 0);

        /* Revenue recorded for this franchise in franchise_payments. */
        $paymentSummary = DB::table('franchise_payments')
            ->where('franchise_id', $franchise->id)
            ->selectRaw('COALESCE(SUM(total_amount), 0) AS total, COALESCE(SUM(paid_amount), 0) AS paid')
            ->first();

        $recentEnrollments = StudentEnrollment::with([
                'student:id,sid,franchise_id,user_id',
                'student.user:id,name,email',
                'course:id,name,code',
                'batch:id,name',
            ])
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('id')
            ->take(6)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'student_name' => $e->student?->user?->name,
                'sid' => $e->student?->sid,
                'course_name' => $e->course?->name,
                'batch_name' => $e->batch?->name,
                'status' => $e->status,
                'payment_status' => $e->payment_status,
            ]);

        return response()->json([
            'franchise' => [
                'name' => $franchise->name,
                'code' => $franchise->code,
                'owner_name' => $franchise->owner_name,
                'status' => $franchise->status,
            ],
            'stats' => [
                'students' => $totalStudents,
                'faculty' => $facultyCount,
                'active_enrollments' => $activeEnrollments,
                'pending_enrollments' => $pendingEnrollments,
                'completed_enrollments' => $completedEnrollments,
                'fees_total' => (float) ($feeSummary->total ?? 0),
                'fees_paid' => (float) ($feeSummary->paid ?? 0),
                'fees_outstanding' => max(0, (float) ($feeSummary->total ?? 0) - (float) ($feeSummary->paid ?? 0)),
                'commission_rate' => $commissionRate,
                'revenue_total' => (float) ($paymentSummary->total ?? 0),
                'revenue_paid' => (float) ($paymentSummary->paid ?? 0),
            ],
            'recent_enrollments' => $recentEnrollments,
        ]);
    }
}
