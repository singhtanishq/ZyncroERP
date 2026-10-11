<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmitCard;
use App\Models\Exam;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Enums\AdmitCardStatus;
use App\Enums\ExamStatus;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminAdmitCardController extends Controller
{
    public function exams()
    {
        return Exam::with(['course', 'batch'])
            ->whereNotIn('status', [ExamStatus::PAST, ExamStatus::CANCELLED])
            ->orderBy('start_time')
            ->get();
    }

    public function students(Exam $exam)
    {
        $studentIds = StudentEnrollment::where('course_id', $exam->course_id)
            ->where('batch_id', $exam->batch_id)
            ->where('status', 'active')
            ->pluck('student_id');
    
        return Student::whereIn('id', $studentIds)
            ->with([
                'user',
                'admitCards' => function ($q) use ($exam) {
                    $q->where('exam_id', $exam->id);
                }
            ])
            ->get()
            ->map(function ($student) {
                $admitCard = $student->admitCards->first();
    
                return [
                    'id' => $student->id,
                    'sid' => $student->sid,
                    'name' => $student->user?->name,
                    'admit_card_id' => $admitCard?->id,
                    'admit_card_status' => $admitCard?->status,
                ];
            });
    }

    public function generate(Exam $exam, Student $student)
    {
        if ($exam->status === ExamStatus::CANCELLED || $exam->start_time->isPast()) {
            return response()->json([
                'message' => 'Admit card generation is locked'
            ], 403);
        }

        /*
         | Only actively enrolled students of the exam's course + batch may
         | receive an admit card — the route accepts bare ids, so this must
         | be verified here.
         */
        $enrolled = StudentEnrollment::where('student_id', $student->id)
            ->where('course_id', $exam->course_id)
            ->where('batch_id', $exam->batch_id)
            ->whereIn('status', ['active', 'pending'])
            ->exists();

        if (! $enrolled) {
            return response()->json([
                'message' => 'Student is not enrolled in this exam\'s course and batch.',
            ], 422);
        }

        return AdmitCard::firstOrCreate(
            [
                'exam_id' => $exam->id,
                'student_id' => $student->id,
            ],
            [
                'qr_token' => Str::uuid(),
                'status' => AdmitCardStatus::GENERATED,
            ]
        );
    }

    public function view(AdmitCard $admitCard)
    {
        return $admitCard->load([
            'exam.course',
            'exam.batch',
            'student.user',
        ]);
    }

    /**
     * PUBLIC PDF (iframe-safe)
     */
    public function pdf(AdmitCard $admitCard)
    {
        $admitCard->load([
            'exam.course',
            'exam.batch',
            'student.user'
        ]);

        $pdf = Pdf::loadView('pdf.admit-card', [
            'admitCard' => $admitCard
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("admit-card-{$admitCard->id}.pdf");
    }
}
