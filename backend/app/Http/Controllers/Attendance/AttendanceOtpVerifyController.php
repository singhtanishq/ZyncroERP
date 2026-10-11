<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceOtpVerifyController extends Controller
{
    public function verify(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $otpRow = DB::table('attendance_otps')
            ->where('email', $data['email'])
            ->where('otp', hash('sha256', $data['otp']))
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 5)
            ->orderByDesc('id')
            ->first();

        if (!$otpRow) {
            /*
             | Failed guesses burn down every live code for this email, so a
             | wrong OTP rate cannot be distributed across multiple codes.
             */
            DB::table('attendance_otps')
                ->where('email', $data['email'])
                ->whereNull('verified_at')
                ->where('expires_at', '>', now())
                ->where('attempts', '<', 5)
                ->increment('attempts');

            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        DB::table('attendance_otps')
            ->where('id', $otpRow->id)
            ->update(['verified_at' => now()]);

        return response()->json(['verified' => true]);
    }
}
