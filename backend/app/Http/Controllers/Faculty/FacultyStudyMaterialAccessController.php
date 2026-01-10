<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\StudyMaterialAccessController;
use App\Models\Batch;
use App\Models\StudyMaterial;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyStudyMaterialAccessController extends StudyMaterialAccessController
{
    public function store(Request $request, $id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules(
            $material
        );

        $data = $request->validate([
            'access_type' => 'required|in:batch',
            'course_id'   => 'required|exists:courses,id',
            'batch_id'    => 'required|exists:batches,id',
        ]);

        {

            FacultyAssignmentService::authorize(
                $data['course_id'],
                $data['batch_id']
            );

            $batch = Batch::where(
                'id',
                $data['batch_id']
            )
            ->where(
                'course_id',
                $data['course_id']
            )
            ->firstOrFail();

        }

        return parent::store($request, $id);
    }

    public function show($id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules(
            $material
        );

        return parent::show($id);
    }
}