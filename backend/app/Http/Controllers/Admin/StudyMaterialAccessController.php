<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudyMaterial;
use App\Models\StudyMaterialAccess;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class StudyMaterialAccessController extends Controller
{
    /* ================= SHOW ACCESS ================= */

    public function show($id)
    {
        $material = StudyMaterial::findOrFail($id);
    
        $rule = $material->accessRules()
            ->with([
                'course:id,name',
                'batch:id,name',
            ])
            ->first();
    
        if (!$rule) {
    
            return response()->json([
                'access_type' => 'all',
                'course_id'   => null,
                'batch_id'    => null,
                'course'      => null,
                'batch'       => null,
            ]);
    
        }
    
        return response()->json([
            'access_type' => $rule->access_type,
            'course_id'   => $rule->course_id,
            'batch_id'    => $rule->batch_id,
            'course'      => $rule->course,
            'batch'       => $rule->batch,
        ]);
    }

    /* ================= STORE ACCESS ================= */

    public function store(Request $request, $id)
    {
        $material = StudyMaterial::findOrFail($id);

        $data = $request->validate([
            'access_type' => 'required|in:all,course,batch',
            'course_id'   => 'nullable|exists:courses,id',
            'batch_id'    => 'nullable|exists:batches,id',
        ]);

        // 🔐 Strict validation
        if ($data['access_type'] === 'course' && empty($data['course_id'])) {
            return response()->json(
                ['message' => 'Course is required for course-level access'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($data['access_type'] === 'batch') {
            if (empty($data['course_id']) || empty($data['batch_id'])) {
                return response()->json(
                    ['message' => 'Course and batch are required for batch-level access'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // 🔗 Ensure batch belongs to course
            $batch = Batch::where('id', $data['batch_id'])
                ->where('course_id', $data['course_id'])
                ->first();

            if (!$batch) {
                return response()->json(
                    ['message' => 'Batch does not belong to selected course'],
                    Response::HTTP_CONFLICT
                );
            }
        }

        DB::transaction(function () use ($material, $data) {

            // Clear previous rules (single source of truth)
            $material->accessRules()->delete();

            if ($data['access_type'] === 'all') {
                StudyMaterialAccess::create([
                    'study_material_id' => $material->id,
                    'access_type'       => 'all',
                ]);
                return;
            }

            if ($data['access_type'] === 'course') {
                StudyMaterialAccess::create([
                    'study_material_id' => $material->id,
                    'access_type'       => 'course',
                    'course_id'         => $data['course_id'],
                ]);
                return;
            }

            // batch
            StudyMaterialAccess::create([
                'study_material_id' => $material->id,
                'access_type'       => 'batch',
                'course_id'         => $data['course_id'],
                'batch_id'          => $data['batch_id'],
            ]);
        });

        return response()->json([
            'message' => 'Access rules updated successfully',
        ]);
    }
}
