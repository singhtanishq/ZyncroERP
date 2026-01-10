<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MarkAttendanceController extends Controller
{
    public function mark(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'qr_token' => 'required|string',
        ]);

        $session = DB::table('attendance_sessions')
            ->where('qr_token', $data['qr_token'])
            ->where('ends_at', '>', now())
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Attendance session expired'
            ], 410);
        }

        /*
         | Attendance can only be marked after the student verified an OTP
         | for this email recently. The OTP row is consumed (deleted) so a
         | single verification cannot be reused.
         */
        $verifiedOtp = DB::table('attendance_otps')
            ->where('email', $data['email'])
            ->whereNotNull('verified_at')
            ->where('verified_at', '>', now()->subMinutes(15))
            ->orderByDesc('id')
            ->first();

        if (!$verifiedOtp) {
            return response()->json([
                'message' => 'Please verify your OTP before marking attendance'
            ], 403);
        }

        $student = DB::table('students')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->where('users.email', $data['email'])
            ->select('students.id')
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        $activeEnrollment = DB::table('student_enrollments')
            ->where('student_id', $student->id)
            ->where('course_id', $session->course_id)
            ->where('batch_id', $session->batch_id)
            ->where('status', 'active')
            ->exists();

        if (!$activeEnrollment) {
            return response()->json([
                'message' => 'Student not eligible for this class'
            ], 403);
        }

        DB::table('attendances')->updateOrInsert(
            [
                'attendance_session_id' => $session->id,
                'student_id'            => $student->id,
            ],
            [
                'marked_at' => now(),
                'status'    => 'present',
                'updated_at'=> now(),
                'created_at'=> now(),
            ]
        );

        DB::table('attendance_otps')
            ->where('id', $verifiedOtp->id)
            ->delete();

        return response()->json([
            'course' => $session->course_id,
            'batch'  => $session->batch_id,
        ]);
    }
}
