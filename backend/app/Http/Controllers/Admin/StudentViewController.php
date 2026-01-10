<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;

class StudentViewController extends Controller
{
    public function show($studentId)
    {
        $student = Student::with([
            'user',
            'activeEnrollment.course',
            'activeEnrollment.batch',
        ])
        ->where('id', $studentId)
        ->firstOrFail();

        return response()->json([
            'student_id' => $student->id,
            'sid' => $student->sid,

            'course_id' => $student->course_id,
            'batch_id' => $student->batch_id,

            'admission_date' => $student->admission_date,

            'user' => [
                'name' => $student->user->name,
                'email' => $student->user->email,
                'dob' => $student->user->dob,
                'country' => $student->user->country,
                'mobile' => $student->user->mobile,
            ],

            'enrollment' => $student->activeEnrollment
                ? [
                    'id' => $student->activeEnrollment->id,

                    'course_name' =>
                        $student->activeEnrollment->course?->name,

                    'batch_name' =>
                        $student->activeEnrollment->batch?->name,

                    'joined_at' =>
                        $student->activeEnrollment->joined_at,

                    'completion_date' =>
                        $student->activeEnrollment->completion_date,

                    'status' =>
                        $student->activeEnrollment->status,

                    'payment_status' =>
                        $student->activeEnrollment->payment_status,

                    'remarks' =>
                        $student->activeEnrollment->remarks,
                ]
                : null,
        ]);
    }
}