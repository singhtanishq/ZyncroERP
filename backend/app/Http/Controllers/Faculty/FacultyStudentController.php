<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\FacultyAssignment;
use App\Models\StudentEnrollment;

class FacultyStudentController extends Controller
{
    public function index()
    {
        $faculty = Faculty::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        $assignments = FacultyAssignment::where(
            'faculty_id',
            $faculty->id
        )->get();

        $query = StudentEnrollment::with([
                'student.user',
                'course:id,name',
                'batch:id,name',
            ])
            ->where('status', 'active');

        // No assignments => no students; an empty closure would leak the
        // whole institution.
        if ($assignments->isNotEmpty()) {
            $query->where(function ($query) use ($assignments) {

                foreach ($assignments as $assignment) {

                    $query->orWhere(function ($q) use ($assignment) {

                        $q->where(
                            'course_id',
                            $assignment->course_id
                        )
                        ->where(
                            'batch_id',
                            $assignment->batch_id
                        );

                    });

                }

            });
        } else {
            $query->whereRaw('1 = 0');
        }

        return $query
            ->latest()
            ->get()
            ->map(function ($enrollment) {

                return [

                    'id' =>
                        $enrollment->student?->id,

                    'sid' =>
                        $enrollment->student?->sid,

                    'name' =>
                        $enrollment->student?->user?->name,

                    'email' =>
                        $enrollment->student?->user?->email,

                    'course_id' =>
                        $enrollment->course_id,

                    'course_name' =>
                        $enrollment->course?->name,

                    'batch_id' =>
                        $enrollment->batch_id,

                    'batch_name' =>
                        $enrollment->batch?->name,

                    'status' =>
                        $enrollment->status,

                    'joined_at' =>
                        $enrollment->joined_at,

                ];

            })
            ->values();
    }
}