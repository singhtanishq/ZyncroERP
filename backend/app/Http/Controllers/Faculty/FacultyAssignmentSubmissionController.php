<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminAssignmentSubmissionController;
use App\Models\Assignment;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyAssignmentSubmissionController extends AdminAssignmentSubmissionController
{
    /*
    |--------------------------------------------------------------------------
    | View Assignment Submissions
    |--------------------------------------------------------------------------
    */

    public function index($assignmentId)
    {
        $assignment = Assignment::findOrFail($assignmentId);

        FacultyAssignmentService::authorize(
            $assignment->course_id,
            $assignment->batch_id
        );

        return parent::index($assignmentId);
    }
}