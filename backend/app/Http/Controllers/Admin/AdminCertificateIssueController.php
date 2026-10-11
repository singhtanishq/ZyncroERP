<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminCertificateIssueController extends Controller
{
    /**
     * List course-type certificates
     */
    public function index()
    {
        return Certificate::with([
                'certifiable.user:id,name',
                'course:id,name',
                'batch:id,name',
                'exam:id,name'
            ])
            ->where('type', 'course')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Issue certificate (Production-safe)
     */
    public function issue(Certificate $certificate)
    {
        // Ensure this is a course certificate
        if ($certificate->type !== 'course') {
            return response()->json([
                'message' => 'Invalid certificate type'
            ], 422);
        }

        // Already issued
        if ($certificate->issued_at) {
            return response()->json([
                'message' => 'Certificate already issued'
            ], 409);
        }

        if ($certificate->certificate_number) {
            return response()->json([
                'message' => 'Certificate already generated'
            ], 409);
        }

        // Must be passed
        if ($certificate->status !== 'passed') {
            return response()->json([
                'message' => 'Only PASSED exam results can issue certificates'
            ], 422);
        }

        /*
         | A course certificate stands for completing the whole course, not a
         | single exam: the student must hold an active/completed enrollment
         | in the certificate's course + batch and must not have FAILED any
         | other exam of that course + batch.
         */
        $enrolled = StudentEnrollment::where('student_id', $certificate->certifiable_id)
            ->where('course_id', $certificate->course_id)
            ->where('batch_id', $certificate->batch_id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if (! $enrolled) {
            return response()->json([
                'message' => 'Student does not hold an active or completed enrollment for this course and batch.',
            ], 422);
        }

        $failedCount = Certificate::where('certifiable_id', $certificate->certifiable_id)
            ->where('certifiable_type', Student::class)
            ->where('type', 'course')
            ->where('course_id', $certificate->course_id)
            ->where('batch_id', $certificate->batch_id)
            ->where('status', 'failed')
            ->count();

        if ($failedCount > 0) {
            return response()->json([
                'message' => "Cannot issue: the student has {$failedCount} failed exam(s) in this course and batch.",
            ], 422);
        }

        try {
            DB::transaction(function () use ($certificate) {

                $certificateNumber = $this->generateCertificateNumber();

                $certificate->update([
                    'certificate_number' => $certificateNumber,
                    'issued_at'          => now(),
                    'issued_by'          => auth()->id(),
                ]);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Unique-index collision on the random number: let the caller retry.
            return response()->json([
                'message' => 'Certificate number collision — please retry.',
            ], 409);
        }

        return response()->json([
            'message' => 'Certificate issued successfully'
        ]);
    }

    /**
     * Generate unique certificate number
     */
    private function generateCertificateNumber(): string
    {
        do {
    
            $year = now()->format('Y');
    
            // random readable part
            $random = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    
            // cryptographic verification hash (12 hex chars)
            $hash = strtoupper(substr(bin2hex(random_bytes(6)), 0, 12));
    
            $number = "FS-{$year}-{$random}-{$hash}";
    
        } while (
            Certificate::where('certificate_number', $number)->exists()
        );
    
        return $number;
    }
}
