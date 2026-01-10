<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Certificate;

class StudentCertificateController extends Controller
{
    public function enrollments()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        return $student->enrollments()
            ->with([
                'course:id,name',
                'batch:id,name',
            ])
            ->whereIn('status', [
                'active',
                'completed',
            ])
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'course_id' => $enrollment->course_id,
                    'batch_id' => $enrollment->batch_id,
                    'course_name' => $enrollment->course?->name,
                    'batch_name' => $enrollment->batch?->name,
                ];
            });
    }

    public function index($courseId, $batchId)
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        return Certificate::with([
                'course:id,name',
                'batch:id,name',
                'exam:id,name',
            ])
            ->where('type', 'course')
            ->where('certifiable_type', Student::class)
            ->where('certifiable_id', $student->id)
            ->whereNotNull('issued_at')
            ->where('course_id', $courseId)
            ->where('batch_id', $batchId)
            ->orderByDesc('issued_at')
            ->get();
    }
}