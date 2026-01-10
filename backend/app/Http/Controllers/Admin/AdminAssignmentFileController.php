<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminAssignmentFileController extends Controller
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
            time() . '_' .
            preg_replace(
                '/[^A-Za-z0-9\.\-_]/',
                '_',
                $file->getClientOriginalName()
            );

        Storage::disk('local')
            ->putFileAs(
                'assignments',
                $file,
                $filename
            );

        return response()->json([
            'path' =>
                'assignments/' . $filename,
        ]);
    }

    public function view($id)
    {
        $assignment =
            Assignment::findOrFail($id);

        if (!$assignment->assignment_file) {
            abort(404);
        }

        $path = storage_path(
            'app/private/' .
            $assignment->assignment_file
        );

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}