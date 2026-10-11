<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpCode;
use App\Services\OtpService;
use App\Services\EmailService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    protected EmailService $mailer;

    public function __construct(EmailService $mailer)
    {
        $this->mailer = $mailer;
    }

    /**
     * Step 1: Start forgot password flow (email only).
     * POST /api/password/forgot-start
     * Body: { "email": "user@example.com" }
     */
    public function start(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = Str::lower(trim($data['email']));

        $user = User::where('email', $email)->first();

        if (! $user) {
            // You explicitly wanted this message when email doesn't exist
            return response()->json([
                'message' => 'This email is not registered. Please sign up first.',
            ], 422);
        }

        // Store email in session for the next steps; a new start invalidates
        // any verification completed for a previous reset attempt.
        $request->session()->put('password_reset_email', $email);
        $request->session()->forget(['password_reset_verified', 'password_reset_user_id']);

        return response()->json([
            'message' => 'Email verified. Please answer your security questions.',
        ]);
    }

    /**
     * Step 2: Check security questions and send OTP.
     * POST /api/password/forgot-security
     * Body: {
     *   "dob": "2000-01-01",
     *   "country": "India",
     *   "mobile": "+919876543210"
     * }
     *
     * Requires that step 1 has already stored password_reset_email in session.
     */
    public function checkSecurity(Request $request)
    {
        // Must have email from step 1
        $email = $request->session()->get('password_reset_email');

        if (! $email) {
            return response()->json([
                'message' => 'No password reset in progress. Please start again.',
            ], 422);
        }

        // Per-account lockout on failed identity checks — the IP throttle on
        // the route is not enough for guessable PII (dob/country/mobile).
        $securityKey = 'password-reset-security:' . $email;
        if (RateLimiter::tooManyAttempts($securityKey, 5)) {
            return response()->json([
                'message' => 'Too many failed attempts. Please restart the reset process later.',
            ], 429);
        }

        // Validate security answers
        $data = $request->validate([
            'dob'     => ['required', 'date'],
            'country' => ['required', 'string', 'max:100'],
            'mobile'  => ['required', 'string', 'max:20'],
        ]);

        $dob     = $data['dob'];
        $country = trim($data['country']);
        $mobile  = trim($data['mobile']);

        // Find user with ALL fields matching
        $user = User::where('email', $email)
            ->whereDate('dob', $dob)
            ->where('country', $country)
            ->where('mobile', $mobile)
            ->first();

        if (! $user) {
            // Generic message; do not reveal which field is wrong.
            // The per-account counter only ticks on failures.
            RateLimiter::hit($securityKey, 60 * 60);

            return response()->json([
                'message' => 'The details you entered do not match our records.',
            ], 422);
        }

        // Rate-limit OTP requests for this email + IP
        $key = 'password-reset-otp:' . $email . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Too many OTP requests. Try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 60 * 5); // 5 minutes

        $issued = OtpService::issue($email, $user->id);

        if (! $issued['ok']) {
            return response()->json([
                'message' => $issued['message'],
                'retry_after' => $issued['retry_after'] ?? null,
            ], 429);
        }

        $name = $user->name ?? $email;

        $result = $this->mailer->otp($email, $name, $issued['otp']);

        if (! $result['ok']) {
            return response()->json([
                'message' => 'Failed to send OTP — try again later',
            ], 500);
        }

        return response()->json([
            'message'    => 'OTP sent',
            'expires_at' => $issued['expires_at']->toDateTimeString(),
        ]);
    }

    /**
     * Step 3: Verify OTP for password reset.
     * POST /api/password/forgot-verify
     * Body: { "code": "123456" }
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $email = $request->session()->get('password_reset_email');

        if (! $email) {
            return response()->json([
                'message' => 'No password reset in progress.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'User no longer exists.',
            ], 404);
        }

        $code = $request->input('code');

        $result = OtpService::verify($email, (string) $code);

        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        // Mark in session that OTP is verified for this user
        $request->session()->put('password_reset_verified', true);
        $request->session()->put('password_reset_user_id', $user->id);

        return response()->json(['message' => 'OTP verified']);
    }

    /**
     * Step 4: Set new password after OTP verification.
     * POST /api/password/reset
     * Body: { "password": "newpass", "password_confirmation": "newpass" }
     */
    public function reset(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $verified = $request->session()->get('password_reset_verified');
        $userId   = $request->session()->get('password_reset_user_id');
        $email    = $request->session()->get('password_reset_email');

        if (! $verified || ! $userId || ! $email) {
            return response()->json([
                'message' => 'OTP verification required before resetting password.',
            ], 422);
        }

        // The verified identity must still be the identity that started the flow.
        if ((int) User::where('email', $email)->value('id') !== (int) $userId) {
            return response()->json([
                'message' => 'Password reset session is invalid. Please start again.',
            ], 422);
        }

        $user = User::find($userId);

        if (! $user) {
            return response()->json([
                'message' => 'User no longer exists.',
            ], 404);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        // clean up session
        $request->session()->forget('password_reset_verified');
        $request->session()->forget('password_reset_user_id');
        $request->session()->forget('password_reset_email');

        return response()->json([
            'message' => 'Password reset successful. Please log in with your new password.',
        ]);
    }
}
