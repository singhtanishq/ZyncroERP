<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Course;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentEnrollmentController extends Controller
{
    public function availableCourses(Request $request)
    {
        $user = $request->user();

        $student = Student::where('user_id', $user->id)
            ->firstOrFail();

        $enrollments = StudentEnrollment::where(
            'student_id',
            $student->id
        )
        ->get()
        ->keyBy('course_id');

        $batches = Batch::with('course')
            ->where('status', 'active')
            ->whereHas('course', function ($q) {
                $q->where('status', 'active');
            })
            ->orderBy('course_id')
            ->orderBy('start_date')
            ->get();

        $result = $batches->map(function ($batch) use ($enrollments) {

            return [
                'course_id' => $batch->course->id,
                'course_name' => $batch->course->name,

                'batch_id' => $batch->id,
                'batch_name' => $batch->name,

                'start_date' => optional($batch->start_date)
                    ->toDateString(),

                'end_date' => optional($batch->end_date)
                    ->toDateString(),

                'already_enrolled' => $enrollments->has(
                    $batch->course->id
                ),

                'enrollment_status' => optional(
                    $enrollments->get($batch->course->id)
                )->status,
            ];
        });

        return response()->json(
            $result->values()
        );
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $student = Student::where(
            'user_id',
            $user->id
        )->firstOrFail();

        $data = $request->validate([
            'course_id' => [
                'required',
                'exists:courses,id',
            ],

            'batch_id' => [
                'required',
                'exists:batches,id',
            ],
        ]);

        return DB::transaction(function () use (
            $student,
            $data
        ) {

            $batch = Batch::findOrFail(
                $data['batch_id']
            );

            if ($batch->course_id != $data['course_id']) {

                return response()->json([
                    'message' =>
                        'Selected batch does not belong to selected course.'
                ], 422);
            }

            $duplicate = StudentEnrollment::where(
                'student_id',
                $student->id
            )
            ->where(
                'course_id',
                $data['course_id']
            )
            ->exists();

            if ($duplicate) {

                return response()->json([
                    'message' =>
                        'You are already enrolled in this course.'
                ], 422);
            }

            $enrollment = StudentEnrollment::create([

                'student_id' =>
                    $student->id,

                'course_id' =>
                    $data['course_id'],

                'batch_id' =>
                    $data['batch_id'],

                'joined_at' =>
                    now()->toDateString(),

                'status' =>
                    'pending',

                'payment_status' =>
                    'pending',
            ]);

            $course = Course::findOrFail(
                $data['course_id']
            );

            StudentFee::create([

                'student_id' =>
                    $student->id,

                'course_id' =>
                    $course->id,

                'batch_id' =>
                    $batch->id,

                'total_fees' =>
                    $course->amount ?? 0,

                'paid_fees' =>
                    0,

                'status' =>
                    'pending',
            ]);

            return response()->json([
                'message' =>
                    'Enrollment request submitted successfully.',

                'enrollment' =>
                    $enrollment,
            ]);
        });
    }
}