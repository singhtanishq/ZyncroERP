<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminAssignmentFileController;
use App\Models\Assignment;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyAssignmentFileController extends AdminAssignmentFileController
{
    /*
    |--------------------------------------------------------------------------
    | Upload Assignment File
    |--------------------------------------------------------------------------
    */

    public function upload(Request $request)
    {
        $data = $request->validate([
            'course_id' => [
                'required',
                'exists:courses,id',
            ],

            'batch_id' => [
                'required',
                'exists:batches,id',
            ],
        ]);

        FacultyAssignmentService::authorize(
            $data['course_id'],
            $data['batch_id']
        );

        return parent::upload($request);
    }

    /*
    |--------------------------------------------------------------------------
    | View Assignment File
    |--------------------------------------------------------------------------
    */

    public function view($id)
    {
        $assignment = Assignment::findOrFail($id);

        FacultyAssignmentService::authorize(
            $assignment->course_id,
            $assignment->batch_id
        );

        return parent::view($id);
    }
}