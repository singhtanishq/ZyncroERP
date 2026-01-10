<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\FacultySalaryRecord;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminFacultyPayoutController extends Controller
{
    /* ================= INDEX ================= */
    public function index(Request $request)
    {
        $month = $request->query('month');

        if (!$month || !preg_match('/^\d{4}-\d{2}$/', $month)) {
            return response()->json(['message' => 'A valid month (YYYY-MM) is required'], 400);
        }

        $selectedMonthStart = Carbon::parse($month . '-01')->startOfMonth();

        $faculties = Faculty::where(function ($q) use ($selectedMonthStart) {
            $q->whereNull('join_date')
              ->orWhere('join_date', '<=', $selectedMonthStart);
        })
        ->orderBy('name')
        ->get();

        return $faculties->map(function ($f) use ($month) {

            $record = FacultySalaryRecord::where('faculty_id', $f->id)
                ->where('month', $month)
                ->first();

            return [
                'id' => $f->id,
                'code' => $f->code,
                'name' => $f->name,
                'salary' => $f->salary ?? 0,
                'status' => $record ? $record->status : 'unpaid',
                'join_date' => $f->join_date,
            ];
        });
    }

    /* ================= UPDATE SALARY ================= */
    public function updateSalary(Request $request, $id)
    {
        $data = $request->validate([
            'salary' => 'required|numeric|min:0',
        ]);

        Faculty::where('id', $id)->update([
            'salary' => $data['salary'],
        ]);

        return response()->json(['message' => 'Salary updated']);
    }

    /* ================= MARK PAID ================= */
    public function markPaid(Request $request, $id)
    {
        $data = $request->validate([
            'month' => 'required|regex:/^\d{4}-\d{2}$/',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $faculty = Faculty::findOrFail($id);

        FacultySalaryRecord::updateOrCreate(
            [
                'faculty_id' => $id,
                'month' => $data['month'],
            ],
            [
                'amount' => $data['amount'] ?? $faculty->salary,
                'status' => 'paid',
                'paid_at' => now(),
            ]
        );

        return response()->json(['message' => 'Marked paid']);
    }

    /* ================= HISTORY ================= */
    public function history($id)
    {
        $faculty = Faculty::findOrFail($id);

        if (!$faculty->join_date) {
            return [];
        }

        $start = Carbon::parse($faculty->join_date)->startOfMonth();
        $end = now()->startOfMonth();

        $months = [];

        while ($start <= $end) {
            $month = $start->format('Y-m');

            $record = FacultySalaryRecord::where('faculty_id', $id)
                ->where('month', $month)
                ->first();

            $months[] = [
                'month' => $month,
                'status' => $record ? $record->status : 'unpaid',
            ];

            $start->addMonth();
        }

        return $months;
    }
}