<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AssignmentSubmission;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentAssignmentFileController extends Controller
{
    public function upload(Request $request)
    {
        $data = $request->validate([
            'assignment_id' => [
                'required',
                'integer',
                'exists:assignments,id',
            ],
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,ppt,pptx,zip',
                'max:10240',
            ],
        ]);

        $student = \App\Models\Student::where('user_id', auth()->id())->firstOrFail();

        $assignment = \App\Models\Assignment::findOrFail($data['assignment_id']);

        /*
         | Uploads are bound to a real assignment the student is enrolled in;
         | anonymous unrestricted uploads used to allow unlimited orphaned
         | files from any authenticated account.
         */
        $enrolled = $student
            ->enrollments()
            ->where('status', 'active')
            ->where('course_id', $assignment->course_id)
            ->where('batch_id', $assignment->batch_id)
            ->exists();

        if (! $enrolled) {
            return response()->json([
                'message' => 'You are not enrolled in this assignment\'s course and batch.',
            ], 403);
        }

        $file = $request->file('file');

        $filename =
            time() .
            '_' .
            Str::random(8) .
            '_' .
            preg_replace(
                '/[^A-Za-z0-9\.\-_]/',
                '_',
                $file->getClientOriginalName()
            );

        // Replacing a previous draft for the same assignment: drop the old file.
        $previous = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        if ($previous) {
            return response()->json([
                'message' => 'This assignment has already been submitted — no further uploads are allowed.',
            ], 422);
        }

        Storage::disk('local')
            ->putFileAs(
                'assignment-submissions',
                $file,
                $filename
            );

        return response()->json([
            'path' =>
                'assignment-submissions/' .
                $filename,
        ]);
    }
    
    public function view(Request $request, $path)
    {
        // Only simple filenames are allowed — block traversal and nested paths.
        if (str_contains($path, '..') || str_contains($path, '/') || str_contains($path, '\\')) {
            abort(404);
        }

        $filePath = 'assignment-submissions/' . $path;

        $user = $request->user();

        $submission = AssignmentSubmission::with([
            'student:id,user_id',
            'assignment:id,course_id,batch_id',
        ])->where('response_file', $filePath)->first();

        $authorized = false;

        if ($user->role === 'admin') {
            $authorized = true;
        } elseif ($submission) {
            if (
                $user->role === 'student'
                && $submission->student
                && (int) $submission->student->user_id === (int) $user->id
            ) {
                $authorized = true;
            } elseif (
                $user->role === 'faculty'
                && $submission->assignment
                && FacultyAssignmentService::hasAssignment(
                    $submission->assignment->course_id,
                    $submission->assignment->batch_id
                )
            ) {
                $authorized = true;
            }
        }

        abort_unless($authorized, 403);

        $fullPath = storage_path('app/private/' . $filePath);

        if (!file_exists($fullPath)) {
            abort(404);
        }

        return response()->file($fullPath);
    }
}