<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStudentFeeController extends Controller
{
    /**
     * One row per StudentFee (a student may hold several, one per course).
     */
    public function index()
    {
        $fees = StudentFee::with(['student.user:id,name', 'student.course:id,name', 'student.batch:id,name'])
            ->orderBy('student_id')
            ->get();

        return $fees->map(function (StudentFee $fee) {
            $student = $fee->student;

            return [
                // Kept as the student id so the existing update route works.
                'id' => $student?->id,
                'fee_id' => $fee->id,
                'sid' => $student?->sid,
                'name' => $student?->user?->name ?? '—',
                'course' => $fee->course?->name ?? $student?->course?->name ?? '—',
                'batch' => $fee->batch?->name ?? $student?->batch?->name ?? '—',
                'course_id' => $fee->course_id,
                'batch_id' => $fee->batch_id,
                'total_fees' => $fee->total_fees,
                'paid_fees' => $fee->paid_fees,
                'status' => $fee->status,
            ];
        })->filter(fn ($row) => $row['id'] !== null)->values();
    }

    public function update(Request $request, $studentId)
    {
        $data = $request->validate([
            'paid_fees' => 'required|numeric|min:0',
            'course_id' => 'nullable|integer|exists:courses,id',
        ]);

        $student = Student::with('course')->findOrFail($studentId);

        /*
         | A student can hold one fee row per course. Scope the update to the
         | requested course when given, and NEVER rewrite the row's
         | course/batch — that used to corrupt the sibling fee record.
         */
        $feeQuery = StudentFee::where('student_id', $student->id);

        if (! empty($data['course_id'])) {
            $feeQuery->where('course_id', $data['course_id']);
        }

        $fee = $feeQuery->first();

        if (! $fee) {
            return response()->json([
                'message' => 'No fee record found for this student'
                    . (! empty($data['course_id']) ? ' and course.' : '.'),
            ], 404);
        }

        $paid = $data['paid_fees'];
        $total = (float) $fee->total_fees;

        if ($paid > $total) {
            return response()->json([
                'message' => "Paid amount ({$paid}) cannot exceed the total fee ({$total}).",
            ], 422);
        }

        $status = 'pending';
        if ($paid > 0 && $paid < $total) $status = 'partial';
        // A zero-total (free) course is settled as soon as nothing is owed.
        if ($total == 0 || $paid >= $total) $status = 'paid';

        $fee->update([
            'paid_fees' => $paid,
            'status' => $status,
        ]);

        return $fee->fresh();
    }
}
