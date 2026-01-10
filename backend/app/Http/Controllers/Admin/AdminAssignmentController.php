<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;

class AdminAssignmentController extends Controller
{
    public function index()
    {
        return Assignment::with([
            'course:id,name',
            'batch:id,name',
        ])
        ->latest()
        ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'course_id' => [
                'required',
                'exists:courses,id',
            ],

            'batch_id' => [
                'required',
                'exists:batches,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'question' => [
                'required',
                'string',
            ],

            'assignment_link' => [
                'nullable',
                'url',
            ],
            
            'assignment_file' => [
                'nullable',
                'string',
            ],

            'deadline' => [
                'required',
                'date',
            ],
        ]);
        
        $batch = \App\Models\Batch::findOrFail($data['batch_id']);

        if ($batch->course_id != $data['course_id']) {
        
            return response()->json([
                'message' => 'Selected batch does not belong to the selected course.',
            ], 422);
        
        }

        $assignment = Assignment::create([
            ...$data,

            'created_by' => auth()->id(),

            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Assignment created successfully.',
            'assignment' => $assignment,
        ]);
    }

    public function show($id)
    {
        return Assignment::with([
            'course',
            'batch',
            'submissions.student.user',
        ])->findOrFail($id);
    }
}