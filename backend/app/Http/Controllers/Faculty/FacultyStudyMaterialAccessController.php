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

        /*
         | Write access: the creator may attach the first rule to their own
         | material (otherwise freshly created content is stuck with zero
         | rules and can never be published); everyone else needs a matching
         | course/batch rule.
         */
        FacultyAssignmentService::authorizeAccessRules(
            $material,
            'accessRules',
            true
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