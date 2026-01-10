<?php

namespace App\Http\Controllers\Faculty;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Http\Controllers\Admin\AdminExamResultController;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyExamResultController extends AdminExamResultController
{
    public function index(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);

        FacultyAssignmentService::authorize(
            $request->course_id,
            $request->batch_id
        );

        return parent::index($request);
    }

    public function save(Request $request)
    {
        $request->validate([
            'student_id'        => 'required|exists:students,id',
            'scores'            => 'required|array',
            'scores.*.exam_id'  => 'required|exists:exams,id',
            'scores.*.score'    => 'nullable|numeric|min:0|max:100',
        ]);

        $exam = Exam::findOrFail(
            $request->scores[0]['exam_id']
        );

        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::save($request);
    }
}