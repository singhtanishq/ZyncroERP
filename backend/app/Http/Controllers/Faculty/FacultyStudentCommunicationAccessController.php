<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminStudentCommunicationAccessController;
use App\Models\StudentCommunication;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyStudentCommunicationAccessController extends AdminStudentCommunicationAccessController
{
    public function show($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($communication);

        return parent::show($id);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'access_type' => 'required|in:batch',
            'course_id'   => 'required|exists:courses,id',
            'batch_id'    => 'required|exists:batches,id',
        ]);

        FacultyAssignmentService::authorize(
            (int) $request->course_id,
            (int) $request->batch_id
        );

        return parent::store($request, $id);
    }
}