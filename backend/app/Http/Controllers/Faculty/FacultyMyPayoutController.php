<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Models\FacultySalaryRecord;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyMyPayoutController extends Controller
{
    /**
     * The authenticated faculty member's salary and payout history.
     */
    public function index(Request $request)
    {
        $faculty = FacultyAssignmentService::faculty();

        $records = FacultySalaryRecord::where('faculty_id', $faculty->id)
            ->orderByDesc('month')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'month' => $r->month,
                'amount' => (float) $r->amount,
                'status' => $r->status,
                'paid_at' => $r->paid_at,
            ]);

        return response()->json([
            'salary' => (float) ($faculty->salary ?? 0),
            'records' => $records,
            'summary' => [
                'paid_months' => $records->where('status', 'paid')->count(),
                'total_received' => (float) $records->where('status', 'paid')->sum('amount'),
            ],
        ]);
    }
}
