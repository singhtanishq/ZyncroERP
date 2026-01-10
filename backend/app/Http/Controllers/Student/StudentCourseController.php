<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;

class StudentCourseController extends Controller
{
    public function index()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        return $student
            ->enrollments()
            ->with([
                'course:id,name,code',
                'batch:id,name'
            ])
            ->latest()
            ->get();
    }
    
    public function show($id)
    {
        $user = auth()->user();
    
        $student = \App\Models\Student::where(
            'user_id',
            $user->id
        )->firstOrFail();
    
        $enrollment = \App\Models\StudentEnrollment::with([
            'course',
            'batch'
        ])
        ->where('student_id', $student->id)
        ->where('id', $id)
        ->firstOrFail();
    
        return response()->json($enrollment);
    }
}