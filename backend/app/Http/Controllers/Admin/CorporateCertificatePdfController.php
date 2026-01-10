<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CorporateCertificate;
use Barryvdh\DomPDF\Facade\Pdf;

class CorporateCertificatePdfController extends Controller
{
    /**
     * Public verification endpoints resolve by the non-sequential
     * certificate number, not the database id.
     */
    public function view(string $certificateNumber)
    {
        $certificate = CorporateCertificate::with('employee.role')
            ->where('certificate_number', $certificateNumber)
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.corporate-certificate', compact('certificate'));

        return $pdf->stream("{$certificateNumber}.pdf");
    }

    public function download(string $certificateNumber)
    {
        $certificate = CorporateCertificate::with('employee.role')
            ->where('certificate_number', $certificateNumber)
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.corporate-certificate', compact('certificate'));

        return $pdf->download("{$certificateNumber}.pdf");
    }
}