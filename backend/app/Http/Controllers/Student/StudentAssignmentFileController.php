<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AssignmentSubmission;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentAssignmentFileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,ppt,pptx,zip',
                'max:20480',
            ],
        ]);

        $file = $request->file('file');

        $filename =
            time() .
            '_' .
            preg_replace(
                '/[^A-Za-z0-9\.\-_]/',
                '_',
                $file->getClientOriginalName()
            );

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