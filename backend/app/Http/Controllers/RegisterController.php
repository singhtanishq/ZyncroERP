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

class RegisterController extends Controller
{
    protected EmailService $mailer;

    public function __construct(EmailService $mailer)
    {
        $this->mailer = $mailer;
    }

    /**
     * Step 1: Start signup - validate name/email/role & send OTP.
     * POST /api/register/start
     */
    public function start(Request $request)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'role'  => ['required', 'string'],
        ]);

        $email = strtolower($data['email']);
        $name  = $data['name'];
        $role  = strtolower($data['role']);

        // Allow only these roles via signup
        $allowedRoles = ['student', 'faculty', 'franchise'];

        // Hard rule: admin user is ONLY created via seeder, not signup
        if (! in_array($role, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Invalid role selected.',
            ], 422);
        }

        // Email must be unique
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message' => 'This email is already registered. Please log in instead.',
            ], 422);
        }

        // Rate-limit OTP requests for this email + IP
        $key = 'signup-otp:' . Str::lower($email) . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Too many OTP requests. Try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 60 * 5); // 5 minutes

        $issued = OtpService::issue($email);

        if (! $issued['ok']) {
            return response()->json([
                'message' => $issued['message'],
                'retry_after' => $issued['retry_after'] ?? null,
            ], 429);
        }

        $result = $this->mailer->otp($email, $name, $issued['otp']);

        if (! $result['ok']) {
            return response()->json([
                'message' => 'Failed to send OTP — try again later',
            ], 500);
        }

        // Save signup data in session (but do NOT create user yet)
        $request->session()->put('signup_email', $email);
        $request->session()->put('signup_name', $name);
        $request->session()->put('signup_role', $role);
        $request->session()->put('signup_verified', false);

        return response()->json([
            'message'    => 'Signup OTP sent',
            'expires_at' => $issued['expires_at']->toDateTimeString(),
        ]);
    }

    /**
     * Step 2: Verify signup OTP
     * POST /api/register/verify
     * Body: { "code": "123456" }
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $email = $request->session()->get('signup_email');
        $name  = $request->session()->get('signup_name');
        $role  = $request->session()->get('signup_role');

        if (! $email || ! $name || ! $role) {
            return response()->json([
                'message' => 'No signup in progress.',
            ], 422);
        }

        $code = $request->input('code');

        $result = OtpService::verify($email, (string) $code);

        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $request->session()->put('signup_verified', true);

        return response()->json([
            'message' => 'Signup email verified',
        ]);
    }

    /**
     * Step 3: Complete signup after email verification
     * POST /api/register/complete
     * Body:
     * {
     *   "password": "...",
     *   "password_confirmation": "...",
     *   "dob": "YYYY-MM-DD",
     *   "country": "India",
     *   "mobile": "9876543210"
     * }
     */
    public function complete(Request $request)
    {
        $data = $request->validate([
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
            'dob'                   => ['required', 'date'],
            'country'               => ['required', 'string', 'max:100'],
            'mobile'                => ['required', 'string', 'max:30'],
        ]);

        $email    = $request->session()->get('signup_email');
        $name     = $request->session()->get('signup_name');
        $role     = $request->session()->get('signup_role');
        $verified = $request->session()->get('signup_verified', false);

        if (! $email || ! $name || ! $role || ! $verified) {
            return response()->json([
                'message' => 'Email verification is required before signup.',
            ], 422);
        }

        // Ensure still unique
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message' => 'This email is already registered. Please log in instead.',
            ], 422);
        }

        // Roles allowed from session (same guard as start)
        $allowedRoles = ['student', 'faculty', 'franchise'];
        if (! in_array($role, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Invalid role selected.',
            ], 422);
        }

        $user = User::create([
            'name'              => $name,
            'email'             => $email,
            'password'          => Hash::make($data['password']),
            'role'              => $role,
            'approve_status'    => false, // must be approved by admin later
            'email_verified_at' => Carbon::now(),
            'dob'               => $data['dob'],
            'country'           => $data['country'],
            'mobile'            => $data['mobile'],
        ]);

        // cleanup signup session
        $request->session()->forget('signup_email');
        $request->session()->forget('signup_name');
        $request->session()->forget('signup_role');
        $request->session()->forget('signup_verified');

        return response()->json([
            'message' => 'Signup successful. Please log in.',
            'user'    => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role,
                'country' => $user->country,
            ],
        ]);
    }
}
