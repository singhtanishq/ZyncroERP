<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;

class StudentTrackFeesController extends Controller
{
    public function index()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )
        ->with([
            'enrollments.course',
            'enrollments.batch',
            'enrollments.enrollmentDocuments',
            'fees'
        ])
        ->firstOrFail();

        return $student->enrollments->map(function ($enrollment) use ($student) {

            $fee = $student->fees
                ->where('course_id', $enrollment->course_id)
                ->first();

            $paymentProof = $enrollment
                ->enrollmentDocuments
                ->where('document_type', 'payment_proof')
                ->first();

            return [
                'enrollment_id' => $enrollment->id,

                'course_name' =>
                    $enrollment->course?->name,

                'batch_name' =>
                    $enrollment->batch?->name,

                'total_fees' =>
                    $fee?->total_fees ?? 0,

                'paid_fees' =>
                    $fee?->paid_fees ?? 0,

                'balance_fees' =>
                    max(
                        ($fee?->total_fees ?? 0)
                        -
                        ($fee?->paid_fees ?? 0),
                        0
                    ),

                'fee_status' =>
                    $fee?->status ?? 'pending',

                'document_status' =>
                    $paymentProof?->verification_status
                    ?? 'not_uploaded',

                'enrollment_status' =>
                    $enrollment->status,

                'payment_status' =>
                    $enrollment->payment_status,
            ];
        });
    }
}