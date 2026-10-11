<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;

class StudentIdCardPdfController extends Controller
{
    private function generateQr(string $text): string
    {
        $result = \Endroid\QrCode\Builder\Builder::create()
            ->writer(new \Endroid\QrCode\Writer\PngWriter())
            ->data($text)
            ->size(200)
            ->margin(4)
            ->build();

        return base64_encode($result->getString());
    }

    public function view($token)
    {
        $student = Student::with(['user', 'idCard'])
            ->whereHas('idCard', function ($q) use ($token) {
                $q->where('public_token', $token);
            })
            ->firstOrFail();
            
        abort_if(!$student->idCard, 404);

        $qr = $this->generateQr($student->sid);

        $pdf = Pdf::loadView('pdf.student-id-card', [
            'student' => $student,
            'card'    => $student->idCard,
            'qr'      => $qr,
        ]);

        return $pdf->stream("ID_Card_{$student->sid}.pdf");
    }

    public function download($token)
    {
        $student = Student::with(['user', 'idCard'])
            ->whereHas('idCard', function ($q) use ($token) {
                $q->where('public_token', $token);
            })
            ->firstOrFail();
    
        abort_if(!$student->idCard, 404);

        $qr = $this->generateQr($student->sid);

        $pdf = Pdf::loadView('pdf.student-id-card', [
            'student' => $student,
            'card'    => $student->idCard,
            'qr'      => $qr,
        ]);

        return $pdf->download("ID_Card_{$student->sid}.pdf");
    }
}
