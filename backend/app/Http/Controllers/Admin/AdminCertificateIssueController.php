<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
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

        DB::transaction(function () use ($certificate) {

            $certificateNumber = $this->generateCertificateNumber();

            $certificate->update([
                'certificate_number' => $certificateNumber,
                'issued_at'          => now(),
                'issued_by'          => auth()->id(),
            ]);
        });

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
