<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

class StudentPaymentController extends Controller
{
    public function enrollments(Request $request)
    {
        $student = Student::where('user_id', auth()->id())
            ->firstOrFail();

        return StudentEnrollment::with([
                'course:id,name,amount',
                'batch:id,name',
            ])
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($enrollment) {

                return [
                    'id' => $enrollment->id,

                    'course_name' =>
                        $enrollment->course?->name,

                    'batch_name' =>
                        $enrollment->batch?->name,

                    'enrollment_status' =>
                        $enrollment->status,

                    'payment_status' =>
                        $enrollment->payment_status,

                    'course_amount' =>
                        (float) ($enrollment->course?->amount ?? 0),
                ];
            });
    }
}