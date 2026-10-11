<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\OnlineClassAccessController;
use App\Models\Batch;
use App\Models\OnlineClass;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyOnlineClassAccessController extends OnlineClassAccessController
{
    public function store(Request $request, $id)
    {
        $class = OnlineClass::with('accessRules')
            ->findOrFail($id);

        /*
         | Write access: the creator may attach the first rule to their own
         | class; everyone else needs a matching course/batch rule.
         */
        FacultyAssignmentService::authorizeAccessRules(
            $class,
            'accessRules',
            true
        );

        $data = $request->validate([
            'access_type' => 'required|in:batch',
            'course_id'   => 'required|exists:courses,id',
            'batch_id'    => 'required|exists:batches,id',
        ]);

        FacultyAssignmentService::authorize(
            $data['course_id'],
            $data['batch_id']
        );

        Batch::where(
            'id',
            $data['batch_id']
        )
        ->where(
            'course_id',
            $data['course_id']
        )
        ->firstOrFail();

        return parent::store($request, $id);
    }

    public function show($id)
    {
        $class = OnlineClass::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules(
            $class
        );

        return parent::show($id);
    }
}