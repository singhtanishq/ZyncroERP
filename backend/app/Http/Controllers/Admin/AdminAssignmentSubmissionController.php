<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;

class AdminAssignmentSubmissionController extends Controller
{
    public function index($assignmentId)
    {
        $assignment = Assignment::with([
            'course:id,name',
            'batch:id,name',
            'submissions.student.user',
        ])->findOrFail($assignmentId);

        return response()->json([
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'deadline' => $assignment->deadline,
                'course_name' => $assignment->course?->name,
                'batch_name' => $assignment->batch?->name,
            ],

            'total_submissions' =>
                $assignment->submissions->count(),

            'submissions' =>
                $assignment->submissions
                ->map(function ($submission) {

                    return [
                        'id' => $submission->id,

                        'student_id' =>
                            $submission->student?->sid,

                        'student_name' =>
                            $submission->student?->user?->name,

                        'student_email' =>
                            $submission->student?->user?->email,

                        'response_link' =>
                            $submission->response_link,
                        
                        'response_file' =>
                            $submission->response_file,

                        'submitted_at' =>
                            $submission->submitted_at,
                    ];
                }),
        ]);
    }
}