<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminStudentCommunicationController;
use App\Models\StudentCommunication;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyStudentCommunicationController extends AdminStudentCommunicationController
{
    public function index()
    {
        $query = StudentCommunication::with([
            'creator:id,name',
            'accessRules.course:id,name',
            'accessRules.batch:id,name',
        ])->orderByDesc('created_at');

        FacultyAssignmentService::applyAccessRules($query);

        return $query->get();
    }

    public function store(Request $request)
    {
        return parent::store($request);
    }

    public function update(Request $request, $id)
    {
        $communication = StudentCommunication::findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($communication, 'accessRules', true);

        return parent::update($request, $id);
    }

    public function toggle($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($communication, 'accessRules', true);

        return parent::toggle($id);
    }

    public function destroy($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($communication, 'accessRules', true);

        return parent::destroy($id);
    }
}