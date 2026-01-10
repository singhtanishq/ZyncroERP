<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\StudyMaterialController as AdminStudyMaterialController;
use App\Models\StudyMaterial;
use App\Services\Faculty\FacultyAssignmentService;
use App\Http\Controllers\Faculty\Concerns\AuthorizesFacultyAssignments;
use Illuminate\Http\Request;

class FacultyStudyMaterialController extends AdminStudyMaterialController
{
    public function index()
    {
        return FacultyAssignmentService::applyAccessRules(
            StudyMaterial::with([
                'creator:id,name'
            ])
        )
        ->latest()
        ->get()
        ->map(function ($material) {

            $material->file_url = $material->file_path
                ? asset($material->file_path)
                : null;

            return $material;

        });
    }

    public function update(Request $request, $id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        $this->authorizeAccess($material);

        return parent::update($request, $id);
    }

    public function toggle($id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        $this->authorizeAccess($material);

        return parent::toggle($id);
    }

    public function destroy($id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        $this->authorizeAccess($material);

        return parent::destroy($id);
    }

    public function view($id)
    {
        $material = StudyMaterial::with('accessRules')
            ->findOrFail($id);

        $this->authorizeAccess($material);

        return parent::view($id);
    }
}