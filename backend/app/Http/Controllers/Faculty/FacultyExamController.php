<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminExamController;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyExamController extends AdminExamController
{
    public function index()
    {
        $query = Exam::with([
            'course',
            'batch',
        ]);
    
        FacultyAssignmentService::applyCourseBatchFilter(
            $query
        );
    
        $exams = $query
            ->latest('start_time')
            ->get();
    
        $now = now();
    
        foreach ($exams as $exam) {

            // status is cast to the ExamStatus enum — compare against the enum.
            if ($exam->status === \App\Enums\ExamStatus::CANCELLED) {
                continue;
            }
    
            if ($now->lt($exam->start_time)) {
    
                $exam->status = 'upcoming';
    
            } elseif ($now->between(
                $exam->start_time,
                $exam->end_time
            )) {
    
                $exam->status = 'live';
    
            } else {
    
                $exam->status = 'past';
    
            }
    
        }
    
        return response()->json($exams);
    }

    public function store(Request $request)
    {
        FacultyAssignmentService::authorize(
            $request->course_id,
            $request->batch_id
        );

        return parent::store($request);
    }

    public function update(Request $request, Exam $exam)
    {
        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::update($request, $exam);
    }

    public function postpone(Request $request, Exam $exam)
    {
        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );

        return parent::postpone($request, $exam);
    }

    public function cancel(Request $request, Exam $exam)
    {
        FacultyAssignmentService::authorize(
            $exam->course_id,
            $exam->batch_id
        );
    
        return parent::cancel($request, $exam);
    }
}