<?php

namespace App\Http\Controllers\Admin;

use App\Models\Student;
use App\Models\Course;
use App\Models\Batch;
use App\Models\StudentFee;
use App\Http\Controllers\Controller;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

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
        $enrollment = StudentEnrollment::with([
            'enrollmentDocuments',
            'student.fees',
            'course',
        ])->findOrFail($id);
    
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
    }

    public function reject(Request $request, $id)
    {
        $enrollment = StudentEnrollment::findOrFail($id);
    
        $enrollment->update([
            'status' => 'cancelled',
            'remarks' => $request->remarks,
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
            'student_id' => [
                'required',
                'exists:students,id',
            ],
    
            'course_id' => [
                'required',
                'exists:courses,id',
            ],
    
            'batch_id' => [
                'required',
                'exists:batches,id',
            ],
        ]);
    
        $batch = Batch::findOrFail(
            $data['batch_id']
        );
    
        if (
            $batch->course_id !=
            $data['course_id']
        ) {
            return response()->json([
                'message' =>
                    'Selected batch does not belong to selected course.'
            ], 422);
        }
    
        $duplicate =
            StudentEnrollment::where(
                'student_id',
                $data['student_id']
            )
            ->where(
                'course_id',
                $data['course_id']
            )
            ->exists();
    
        if ($duplicate) {
    
            return response()->json([
                'message' =>
                    'Student is already enrolled in this course.'
            ], 422);
        }
    
        $enrollment =
            StudentEnrollment::create([
    
                'student_id' =>
                    $data['student_id'],
    
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
    
        $course = Course::find(
            $data['course_id']
        );
    
        StudentFee::create([
    
            'student_id' =>
                $data['student_id'],
    
            'course_id' =>
                $data['course_id'],
    
            'batch_id' =>
                $data['batch_id'],
    
            'total_fees' =>
                $course->amount ?? 0,
    
            'paid_fees' =>
                0,
    
            'status' =>
                'pending',
        ]);
    
        return response()->json([
            'message' =>
                'Enrollment created successfully.',
            'enrollment' =>
                $enrollment,
        ]);
    }
            
}