<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Barryvdh\DomPDF\Facade\Pdf;

class CourseCertificatePdfController extends Controller
{
    /**
     * Generate QR code image (base64)
     */
    private function generateQr(string $text): string
    {
        $url = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='
            . urlencode($text);

        return base64_encode(file_get_contents($url));
    }

    /**
     * View certificate (public + admin preview)
     * Uses certificate_number instead of ID
     */
    public function view($certificateNumber)
    {
        $certificate = Certificate::with([
                'certifiable.user',
                'course',
                'batch',
                'exam',
            ])
            ->where('certificate_number', $certificateNumber)
            ->where('type', 'course')
            ->firstOrFail();

        // Safety: only issued certificates can be viewed
        abort_if(!$certificate->issued_at, 404);

        // Universal verification URL (same link used everywhere)
        $verificationUrl = url("/api/certificate/{$certificate->certificate_number}");

        // Generate QR code
        $qr = $this->generateQr($verificationUrl);

        $pdf = Pdf::loadView(
            'pdf.course-certificate',
            [
                'certificate'     => $certificate,
                'verificationUrl' => $verificationUrl,
                'qr'              => $qr,
            ]
        )->setPaper('A4', 'landscape');

        return $pdf->stream(
            'Certificate-' . $certificate->certificate_number . '.pdf'
        );
    }
}