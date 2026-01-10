<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\FacultyAssignment;
use App\Models\Course;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFacultyAssignmentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List faculties
    |--------------------------------------------------------------------------
    */

    public function faculties()
    {
        return Faculty::select(
            'id',
            'code',
            'name'
        )
        ->orderBy('name')
        ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | List active courses
    |--------------------------------------------------------------------------
    */

    public function courses()
    {
        return Course::where('status', 'active')
            ->select(
                'id',
                'name'
            )
            ->orderBy('name')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | List batches of selected course
    |--------------------------------------------------------------------------
    */

    public function batches(Request $request, $courseId)
    {
        $facultyId = $request->query('faculty_id');
    
        $query = Batch::where('course_id', $courseId)
            ->where('status', 'active');
    
        if ($facultyId) {
    
            $assignedBatchIds = FacultyAssignment::where(
                    'faculty_id',
                    $facultyId
                )
                ->where('course_id', $courseId)
                ->pluck('batch_id')
                ->filter();
    
            $query->whereNotIn(
                'id',
                $assignedBatchIds
            );
        }
    
        return $query
            ->select(
                'id',
                'name'
            )
            ->orderBy('name')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | View assignments of faculty
    |--------------------------------------------------------------------------
    */

    public function assignments($facultyId)
    {
        return FacultyAssignment::with([
                'course:id,name',
                'batch:id,name',
            ])
            ->where('faculty_id', $facultyId)
            ->latest()
            ->get()
            ->map(function ($assignment) {
    
                return [
                    'id' => $assignment->id,
    
                    'course_id' => $assignment->course_id,
                    'batch_id'  => $assignment->batch_id,
    
                    'course_name' => $assignment->course?->name,
    
                    'batch_name' => $assignment->batch?->name,
    
                    'assigned_at' => optional(
                        $assignment->created_at
                    )->format('d M Y'),
                ];
            });
    }

    /*
    |--------------------------------------------------------------------------
    | Assign course / batch
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $data = $request->validate([
            'faculty_id' => ['required', 'exists:faculties,id'],
            'course_id'  => ['required', 'exists:courses,id'],
            'batch_id'   => ['required', 'exists:batches,id'],
        ]);
    
        return DB::transaction(function () use ($data) {
    
            /*
            |--------------------------------------------------------------------------
            | Validate selected batch belongs to course
            |--------------------------------------------------------------------------
            */
    
            if (!empty($data['batch_id'])) {
    
                $batch = Batch::findOrFail($data['batch_id']);
    
                if ($batch->course_id != $data['course_id']) {
    
                    return response()->json([
                        'success' => false,
                        'message' => 'Selected batch does not belong to the selected course.',
                    ], 422);
                }
            }
    
            /*
            |--------------------------------------------------------------------------
            | Duplicate batch assignment
            |--------------------------------------------------------------------------
            */
    
            $exists = FacultyAssignment::where('faculty_id', $data['faculty_id'])
                ->where('course_id', $data['course_id'])
                ->where('batch_id', $data['batch_id'])
                ->exists();
    
            if ($exists) {
    
                return response()->json([
                    'success' => false,
                    'message' => 'This batch is already assigned.',
                ], 422);
            }
    
            /*
            |--------------------------------------------------------------------------
            | Create assignment
            |--------------------------------------------------------------------------
            */
    
            FacultyAssignment::create([
                'faculty_id' => $data['faculty_id'],
                'course_id'  => $data['course_id'],
                'batch_id'   => $data['batch_id'],
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Assignment created successfully.',
            ]);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Remove assignment
    |--------------------------------------------------------------------------
    */

    public function destroy($assignmentId)
    {
        FacultyAssignment::findOrFail($assignmentId)->delete();
    
        return response()->json([
            'success' => true,
            'message' => 'Assignment removed successfully.',
        ]);
    }
}