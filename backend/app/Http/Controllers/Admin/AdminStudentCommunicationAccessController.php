<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\StudentCommunication;
use App\Models\StudentCommunicationAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AdminStudentCommunicationAccessController extends Controller
{
    /* ================= SHOW ================= */

    public function show($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        return $communication
            ->accessRules()
            ->with([
                'course:id,name',
                'batch:id,name',
            ])
            ->get();
    }

    /* ================= STORE ================= */

    public function store(Request $request, $id)
    {
        $communication = StudentCommunication::findOrFail($id);

        $data = $request->validate([
            'access_type' => 'required|in:all,course,batch',
            'course_id' => 'nullable|exists:courses,id',
            'batch_id' => 'nullable|exists:batches,id',
        ]);

        if (
            $data['access_type'] === 'course'
            && empty($data['course_id'])
        ) {
            return response()->json([
                'message' => 'Course is required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($data['access_type'] === 'batch') {

            if (
                empty($data['course_id'])
                || empty($data['batch_id'])
            ) {
                return response()->json([
                    'message' => 'Course and batch are required.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $batch = Batch::where(
                'id',
                $data['batch_id']
            )
            ->where(
                'course_id',
                $data['course_id']
            )
            ->first();

            if (!$batch) {

                return response()->json([
                    'message' =>
                        'Batch does not belong to selected course.',
                ], Response::HTTP_CONFLICT);

            }
        }

        DB::transaction(function () use (
            $communication,
            $data
        ) {

            $communication
                ->accessRules()
                ->delete();

            if ($data['access_type'] === 'all') {

                StudentCommunicationAccess::create([
                    'communication_id' => $communication->id,
                    'access_type' => 'all',
                ]);

                return;
            }

            if ($data['access_type'] === 'course') {

                StudentCommunicationAccess::create([
                    'communication_id' => $communication->id,
                    'access_type' => 'course',
                    'course_id' => $data['course_id'],
                ]);

                return;
            }

            StudentCommunicationAccess::create([
                'communication_id' => $communication->id,
                'access_type' => 'batch',
                'course_id' => $data['course_id'],
                'batch_id' => $data['batch_id'],
            ]);

        });

        return response()->json([
            'message' => 'Access updated successfully.',
        ]);
    }
}