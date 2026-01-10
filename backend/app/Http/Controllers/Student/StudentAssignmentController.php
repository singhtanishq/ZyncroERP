<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentAssignmentController extends Controller
{
    public function index()
    {
        $student = Student::where('user_id', auth()->id())->firstOrFail();
        
        $activeEnrollments = $student
            ->enrollments()
            ->where('status', 'active')
            ->get();
        
        if ($activeEnrollments->isEmpty()) {
            return [];
        }

        return Assignment::with([
            'course:id,name',
            'batch:id,name',
        ])
        ->where('status', 'active')
        ->where(function ($query) use ($activeEnrollments) {
    
            foreach ($activeEnrollments as $enrollment) {
    
                $query->orWhere(function ($q) use ($enrollment) {
    
                    $q->where(
                        'course_id',
                        $enrollment->course_id
                    )
                    ->where(
                        'batch_id',
                        $enrollment->batch_id
                    );
    
                });
    
            }
    
        })
        ->latest()
        ->get()
            ->map(function ($assignment) use ($student) {

                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $student->id)
                    ->first();

                // ADDED COURSE AND BATCH HERE TO PASS THEM TO THE FRONTEND
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'course' => $assignment->course, 
                    'batch' => $assignment->batch,
                    'deadline' => $assignment->deadline,
                    'submitted' => !!$submission,
                    'submitted_at' => $submission?->submitted_at,
                ];
            });
    }

    public function show($id)
    {
        $student = Student::where('user_id', auth()->id())->firstOrFail();

        $assignment = Assignment::with([
                'course',
                'batch',
            ])
            ->findOrFail($id);
            
        $allowed = $student
            ->enrollments()
            ->where('status', 'active')
            ->where('course_id', $assignment->course_id)
            ->where('batch_id', $assignment->batch_id)
            ->exists();
        
        if (!$allowed) {
            abort(403);
        }

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        return response()->json([
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }
}