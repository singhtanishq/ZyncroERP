<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OnlineClass;
use App\Models\OnlineClassAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OnlineClassAccessController extends Controller
{
    /* ================= SHOW ================= */

    public function show($id)
    {
        $class = OnlineClass::findOrFail($id);
    
        $rule = $class->accessRules()
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

    /* ================= STORE ================= */

    public function store(Request $request, $id)
    {
        $class = OnlineClass::findOrFail($id);

        $data = $request->validate([
            'access_type' => 'required|in:all,course,batch',
            'course_id'   => 'nullable|exists:courses,id',
            'batch_id'    => 'nullable|exists:batches,id',
        ]);

        // A batch rule must reference a batch that belongs to the course —
        // otherwise the rule can never match any student.
        if ($data['access_type'] === 'course' && empty($data['course_id'])) {
            return response()->json(['message' => 'Course is required for course-level access.'], 422);
        }

        if ($data['access_type'] === 'batch') {
            if (empty($data['course_id']) || empty($data['batch_id'])) {
                return response()->json(['message' => 'Course and batch are required for batch-level access.'], 422);
            }

            $batchMatches = \App\Models\Batch::where('id', $data['batch_id'])
                ->where('course_id', $data['course_id'])
                ->exists();

            if (! $batchMatches) {
                return response()->json([
                    'message' => 'Selected batch does not belong to selected course.',
                ], 422);
            }
        }

        DB::transaction(function () use ($class, $data) {

            $class->accessRules()->delete();

            if ($data['access_type'] === 'all') {
                OnlineClassAccess::create([
                    'online_class_id' => $class->id,
                    'access_type'     => 'all',
                ]);
                return;
            }

            if ($data['access_type'] === 'course') {
                OnlineClassAccess::create([
                    'online_class_id' => $class->id,
                    'access_type'     => 'course',
                    'course_id'       => $data['course_id'],
                ]);
                return;
            }

            if ($data['access_type'] === 'batch') {
                OnlineClassAccess::create([
                    'online_class_id' => $class->id,
                    'access_type'     => 'batch',
                    'course_id'       => $data['course_id'],
                    'batch_id'        => $data['batch_id'],
                ]);
            }
        });

        return response()->json([
            'message' => 'Access rules updated successfully',
        ]);
    }
}
