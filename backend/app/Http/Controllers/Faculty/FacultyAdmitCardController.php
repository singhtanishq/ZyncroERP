<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminAdmitCardController;
use App\Models\AdmitCard;
use App\Models\Exam;
use App\Models\Student;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyAdmitCardController extends AdminAdmitCardController
{
    public function exams()
    {
        $query = Exam::with([
            'course',
            'batch',
        ])
        ->where('status', '!=', 'past')
        ->orderBy('start_time');

        FacultyAssignmentService::applyCourseBatchFilter(
            $query
        );

        return $query->get();
    }

    public function students(Exam $exam)
    {
        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::students($exam);
    }

    public function generate(Exam $exam, Student $student)
    {
        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::generate(
            $exam,
            $student
        );
    }

    public function view(AdmitCard $admitCard)
    {
        $exam = $admitCard->exam;

        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::view($admitCard);
    }
}