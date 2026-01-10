<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminAssignmentController;
use App\Models\Assignment;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyAssignmentController extends AdminAssignmentController
{
    /*
    |--------------------------------------------------------------------------
    | List Assignments
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $pairs = FacultyAssignmentService::assignmentPairs();

        return Assignment::with([
                'course:id,name',
                'batch:id,name',
            ])
            ->where(function ($query) use ($pairs) {

                foreach ($pairs as $pair) {

                    $query->orWhere(function ($q) use ($pair) {

                        $q->where(
                            'course_id',
                            $pair['course_id']
                        )
                        ->where(
                            'batch_id',
                            $pair['batch_id']
                        );

                    });

                }

            })
            ->latest()
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Create Assignment
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
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

        return parent::store($request);
    }

    /*
    |--------------------------------------------------------------------------
    | View Assignment
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $assignment = Assignment::findOrFail($id);

        FacultyAssignmentService::authorize(
            $assignment->course_id,
            $assignment->batch_id
        );

        return parent::show($id);
    }
}