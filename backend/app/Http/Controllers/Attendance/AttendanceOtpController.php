<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceOtpController extends Controller
{
    public function send(Request $request, EmailService $mail)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $student = DB::table('students')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->where('users.email', $data['email'])
            ->select('users.name')
            ->first();

        /*
         | Always answer the same way whether or not the email belongs to a
         | student, so this public endpoint cannot be used to enumerate
         | student accounts.
         */
        if ($student) {

            $otp = (string) random_int(100000, 999999);

            DB::table('attendance_otps')->insert([
                'email'      => $data['email'],
                'otp'        => hash('sha256', $otp),
                'expires_at' => now()->addMinutes(5),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $mail->otp($data['email'], $student->name, $otp);
        }

        return response()->json([
            'message' => 'If this email belongs to a student, an OTP has been sent.'
        ]);
    }
}
