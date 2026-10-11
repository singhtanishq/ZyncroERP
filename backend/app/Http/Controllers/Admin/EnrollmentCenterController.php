<?php

namespace App\Http\Controllers\Admin;

use App\Models\Student;
use App\Models\Course;
use App\Models\Batch;
use App\Models\StudentFee;
use App\Http\Controllers\Controller;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentCenterController extends Controller
{
    public function index()
    {
        $rows = StudentEnrollment::query()
            ->join('students', 'students.id', '=', 'student_enrollments.student_id')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->join('courses', 'courses.id', '=', 'student_enrollments.course_id')
            ->leftJoin('batches', 'batches.id', '=', 'student_enrollments.batch_id')
            ->select(
                'student_enrollments.*',
                'students.sid',
                'users.name',
                'users.email',
                'courses.name as course_name',
                'batches.name as batch_name'
            )
            ->latest('student_enrollments.id')
            ->get();

        return response()->json($rows);
    }

    public function show($id)
    {
        $enrollment = StudentEnrollment::with([
            'student.user',
            'enrollmentDocuments',
            'enrollmentDocuments.verifier',
            'student.fees',
            'course',
            'batch'
        ])->findOrFail($id);

        return response()->json($enrollment);
    }

    public function approve($id)
    {
        return DB::transaction(function () use ($id) {
            $enrollment = StudentEnrollment::with([
                'enrollmentDocuments',
                'student.fees',
                'course',
            ])->lockForUpdate()->findOrFail($id);

            if ($enrollment->status !== 'pending') {
                return response()->json([
                    'message' => "Only pending enrollments can be approved (current status: {$enrollment->status}).",
                ], 422);
            }

            $paymentProof = $enrollment->enrollmentDocuments
                ->where('document_type', 'payment_proof')
                ->first();

            if (!$paymentProof) {
                return response()->json([
                    'message' => 'Payment proof not uploaded.',
                ], 422);
            }

            if ($paymentProof->verification_status !== 'verified') {
                return response()->json([
                    'message' => 'Payment proof not verified.',
                ], 422);
            }

            $fee = $enrollment->student->fees
                ->where('course_id', $enrollment->course_id)
                ->first();

            if (!$fee) {
                return response()->json([
                    'message' => 'Fee record not found.',
                ], 422);
            }

            if ((float) $fee->paid_fees < (float) $fee->total_fees) {
                return response()->json([
                    'message' => 'Full course fee not paid.',
                ], 422);
            }

            $enrollment->update([
                'status' => 'active',
                'payment_status' => 'paid',
            ]);

            return response()->json([
                'message' => 'Enrollment approved successfully.',
            ]);
        });
    }

    public function reject(Request $request, $id)
    {
        $data = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $enrollment = StudentEnrollment::findOrFail($id);

        if (in_array($enrollment->status, ['completed'], true)) {
            return response()->json([
                'message' => 'A completed enrollment cannot be rejected.',
            ], 422);
        }

        if ($enrollment->status === 'cancelled') {
            return response()->json([
                'message' => 'This enrollment is already rejected.',
            ], 422);
        }

        $enrollment->update([
            'status' => 'cancelled',
            'remarks' => $data['remarks'],
        ]);

        return response()->json([
            'message' => 'Enrollment rejected'
        ]);
    }

    public function complete($id)
    {
        $enrollment = StudentEnrollment::findOrFail($id);

        if ($enrollment->status !== 'active') {
            return response()->json([
                'message' => 'Only active enrollments can be completed.'
            ], 422);
        }

        $enrollment->update([
            'status' => 'completed',
            'completion_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Enrollment completed'
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'required|exists:batches,id',
        ]);

        return DB::transaction(function () use ($data) {
            $course = Course::lockForUpdate()->findOrFail($data['course_id']);
            $batch = Batch::lockForUpdate()->findOrFail($data['batch_id']);

            if ($batch->course_id !== $course->id) {
                return response()->json([
                    'message' => 'Selected batch does not belong to selected course.'
                ], 422);
            }

            if ($course->status !== 'active' || $batch->status !== 'active') {
                return response()->json([
                    'message' => 'Enrollments require an active course and batch.',
                ], 422);
            }

            $existing = StudentEnrollment::where('student_id', $data['student_id'])
                ->where('course_id', $data['course_id'])
                ->where('batch_id', $data['batch_id'])
                ->first();

            if ($existing && $existing->status !== 'cancelled') {
                return response()->json([
                    'message' => 'Student is already enrolled in this course.'
                ], 422);
            }

            if ($existing) {
                // The (student, course, batch) unique index means a rejected
                // enrollment is revived in place rather than duplicated.
                $existing->update([
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'remarks' => null,
                    'completion_date' => null,
                    'joined_at' => now()->toDateString(),
                ]);

                return response()->json([
                    'message' => 'Enrollment re-opened successfully.',
                    'enrollment' => $existing,
                ]);
            }

            $enrollment = StudentEnrollment::create([
                'student_id' => $data['student_id'],
                'course_id' => $data['course_id'],
                'batch_id' => $data['batch_id'],
                'joined_at' => now()->toDateString(),
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            StudentFee::firstOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'course_id' => $data['course_id'],
                ],
                [
                    'batch_id' => $data['batch_id'],
                    'total_fees' => $course->amount ?? 0,
                    'paid_fees' => 0,
                    'status' => 'pending',
                ]
            );

            return response()->json([
                'message' => 'Enrollment created successfully.',
                'enrollment' => $enrollment,
            ]);
        });
    }
}
