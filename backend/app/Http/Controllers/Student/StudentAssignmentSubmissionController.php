<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentAssignmentSubmissionController extends Controller
{
    public function submit(
        Request $request,
        $assignmentId
    ) {

        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        $assignment =
            Assignment::findOrFail(
                $assignmentId
            );

        $existing =
            AssignmentSubmission::where(
                'assignment_id',
                $assignment->id
            )
            ->where(
                'student_id',
                $student->id
            )
            ->first();

        if ($existing) {
            return response()->json([
                'message' =>
                    'Assignment already submitted.',
            ], 422);
        }

        $data = $request->validate([
            'response_link' => [
                'nullable',
                'url',
            ],

            'response_file' => [
                'nullable',
                'string',
            ],
        ]);

        if (
            empty($data['response_link']) &&
            empty($data['response_file'])
        ) {
            return response()->json([
                'message' =>
                    'Provide file or link.',
            ], 422);
        }

        $submission =
            AssignmentSubmission::create([
                'assignment_id' =>
                    $assignment->id,

                'student_id' =>
                    $student->id,

                'response_link' =>
                    $data['response_link'] ?? null,

                'response_file' =>
                    $data['response_file'] ?? null,

                'submitted_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Assignment submitted successfully.',
            'submission' =>
                $submission,
        ]);
    }
}