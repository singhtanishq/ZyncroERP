<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\FacultyAssignment;
use App\Models\StudentEnrollment;

class FacultyMyCourseController extends Controller
{
    public function index()
    {
        $faculty = Faculty::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        $assignments = FacultyAssignment::with([
                'course:id,name',
                'batch:id,name',
            ])
            ->where(
                'faculty_id',
                $faculty->id
            )
            ->orderBy('course_id')
            ->orderBy('batch_id')
            ->get();

        return $assignments->map(function ($assignment) {

            $studentCount = StudentEnrollment::where(
                'course_id',
                $assignment->course_id
            )
            ->where(
                'batch_id',
                $assignment->batch_id
            )
            ->where(
                'status',
                'active'
            )
            ->count();

            return [

                'assignment_id' =>
                    $assignment->id,

                'course_id' =>
                    $assignment->course_id,

                'course_name' =>
                    $assignment->course?->name,

                'batch_id' =>
                    $assignment->batch_id,

                'batch_name' =>
                    $assignment->batch?->name,

                'students' =>
                    $studentCount,
            ];
        });
    }
}