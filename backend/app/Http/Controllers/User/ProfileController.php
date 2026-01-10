<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\EmailService;

class ProfileController extends Controller
{
    // ================= PROFILE UPDATE =================
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dob' => 'required|date',
            'country' => 'required|string|max:100',
            'mobile' => 'required|string|max:20',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
        ]);
    }

    // ================= PASSWORD (OLD PASSWORD) =================
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Old password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    // ================= SEND OTP =================
    public function sendOtp(Request $request, EmailService $mail)
    {
        $user = $request->user();

        $otp = (string) random_int(100000, 999999);

        // Store OTP (5 mins)
        Cache::put('pwd_otp_' . $user->id, $otp, now()->addMinutes(5));

        // Reset attempts (10 mins)
        Cache::put('pwd_attempts_' . $user->id, 0, now()->addMinutes(10));

        $result = $mail->otp($user->email, $user->name, $otp);

        if (! ($result['ok'] ?? false)) {
            return response()->json([
                'message' => 'Failed to send OTP email. Please try again.'
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
    }

    // ================= VERIFY OTP =================
    public function verifyOtpPassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'otp' => 'required|digits:6',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $otpKey = 'pwd_otp_' . $user->id;
        $attemptKey = 'pwd_attempts_' . $user->id;

        $attempts = Cache::get($attemptKey, 0);

        if ($attempts >= 5) {
            return response()->json([
                'message' => 'Too many attempts. Try again after 10 minutes.'
            ], 429);
        }

        $cachedOtp = Cache::get($otpKey);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            Cache::increment($attemptKey);

            return response()->json([
                'message' => 'Invalid OTP. Attempts left: ' . (5 - ($attempts + 1))
            ], 422);
        }

        // SUCCESS
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        Cache::forget($otpKey);
        Cache::forget($attemptKey);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}