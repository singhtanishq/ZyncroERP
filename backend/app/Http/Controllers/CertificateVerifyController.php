<?php

namespace App\Http\Controllers;

use App\Models\CourseCertificate;

class CertificateVerifyController extends Controller
{
    public function verify(string $certificateId)
    {
        $certificate = CourseCertificate::where('certificate_id', $certificateId)
            ->where('status', 'issued')
            ->with(['student', 'course', 'batch'])
            ->firstOrFail();

        return [
            'certificate_id' => $certificate->certificate_id,
            'student_sid' => $certificate->student->sid,
            'student_name' => $certificate->student->name,
            'course' => $certificate->course->name,
            'batch' => $certificate->batch->name,
            'score' => $certificate->score,
            'issued_at' => $certificate->issued_at,
            'status' => 'Valid',
        ];
    }
}
