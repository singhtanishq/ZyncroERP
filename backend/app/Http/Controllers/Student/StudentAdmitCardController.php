<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AdmitCard;
use App\Models\Student;

class StudentAdmitCardController extends Controller
{
    public function index()
    {
        $student = Student::where('user_id', auth()->id())
            ->firstOrFail();

        return AdmitCard::with([
            'exam.course',
            'exam.batch',
        ])
        ->where('student_id', $student->id)
        ->latest()
        ->get();
    }

    public function show(AdmitCard $admitCard)
    {
        $student = Student::where('user_id', auth()->id())
            ->firstOrFail();

        if ($admitCard->student_id !== $student->id) {
            abort(403);
        }

        return $admitCard->load([
            'exam.course',
            'exam.batch',
        ]);
    }
}