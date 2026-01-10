<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\Request;

class AdminStudentFeeController extends Controller
{
    public function index()
    {
        $students = Student::with(['course', 'batch', 'user'])->get();

        $fees = StudentFee::get()->keyBy('student_id');

        return $students->map(function ($s) use ($fees) {
            $fee = $fees[$s->id] ?? null;

            return [
                'id' => $s->id, 
                'sid' => $s->sid, 
                'name' => $s->user->name ?? '—',
                'course' => $s->course->name ?? '—',
                'batch' => $s->batch->name ?? '—',
                'total_fees' => $fee->total_fees ?? ($s->course->amount ?? 0),
                'paid_fees' => $fee->paid_fees ?? 0,
                'status' => $fee->status ?? 'pending',
            ];
        });
    }

    public function update(Request $request, $studentId)
    {
        $data = $request->validate([
            'paid_fees' => 'required|numeric|min:0',
        ]);

        $student = Student::with('course')->findOrFail($studentId);

        $total = $student->course->amount ?? 0;
        $paid = $data['paid_fees'];

        $status = 'pending';
        if ($paid > 0 && $paid < $total) $status = 'partial';
        if ($paid >= $total) $status = 'paid';

        $fee = StudentFee::updateOrCreate(
            ['student_id' => $studentId],
            [
                'course_id' => $student->course_id,
                'batch_id' => $student->batch_id,
                'total_fees' => $total,
                'paid_fees' => $paid,
                'status' => $status,
            ]
        );

        return $fee;
    }
}