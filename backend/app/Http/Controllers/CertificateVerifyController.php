<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Public certificate verification — resolved by the non-sequential
 * certificate number (never the database id) to prevent enumeration.
 */
class CertificateVerifyController extends Controller
{
    public function verify(string $certificateNumber)
    {
        $key = 'certificate-verify:' . $certificateNumber;
        abort_if(RateLimiter::tooManyAttempts($key, 30), 429, 'Too many verification attempts.');
        RateLimiter::hit($key, 60);

        $certificate = Certificate::query()
            ->where('certificate_number', $certificateNumber)
            ->where('type', 'course')
            ->whereNotNull('issued_at')
            ->with(['certifiable', 'course', 'batch'])
            ->firstOrFail();

        $holder = $certificate->certifiable;

        return [
            'certificate_number' => $certificate->certificate_number,
            'student_sid' => $holder->sid ?? null,
            'student_name' => $holder?->user?->name,
            'course' => $certificate->course?->name,
            'batch' => $certificate->batch?->name,
            'score' => $certificate->score,
            'issued_at' => $certificate->issued_at,
            'status' => 'Valid',
        ];
    }
}
