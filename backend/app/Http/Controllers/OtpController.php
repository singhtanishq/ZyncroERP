<?php

namespace App\Http\Controllers;

use App\Services\OtpService;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OtpController extends Controller
{
    /**
     * Resolve which user we are sending/verifying OTP for.
     * Priority:
     *  1) pending_login_user_id in session (new login flow)
     *  2) fallback to currently authenticated user (future use)
     */
    protected function getLoginTargetUser(Request $request): ?User
    {
        $pendingId = $request->session()->get('pending_login_user_id');

        if ($pendingId) {
            return User::find($pendingId);
        }

        if (auth()->check()) {
            return auth()->user();
        }

        return null;
    }

    /**
     * Send OTP for login (pending login flow).
     * POST /api/send-otp
     * Requires a pending_login_user_id OR an authenticated user.
     */
    public function sendOtp(Request $request)
    {
        $user = $this->getLoginTargetUser($request);

        if (! $user || ! $user->email) {
            return response()->json(['message' => 'No login in progress'], 422);
        }

        $email = $user->email;
        $name = $user->name ?? $email;

        // Per email+IP safeguard on top of the per-email cooldown/hourly caps.
        $key = 'login-otp:' . Str::lower($email) . ':' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Too many OTP requests. Try again later.',
            ], 429);
        }
        RateLimiter::hit($key, 60 * 5); // 5 minutes

        $result = OtpService::issue($email, $user->id);

        if (! $result['ok']) {
            return response()->json([
                'message' => $result['message'],
                'retry_after' => $result['retry_after'] ?? null,
            ], 429);
        }

        app(\App\Services\EmailService::class)->otp($email, $name, $result['otp']);

        return response()->json([
            'message'     => 'OTP sent',
            'expires_at'  => $result['expires_at']->toDateTimeString(),
        ]);
    }

    /**
     * Verify OTP for login (pending login flow).
     * POST /api/verify-otp
     * Body: { "code": "123456" }
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $this->getLoginTargetUser($request);

        if (! $user || ! $user->email) {
            return response()->json(['message' => 'No login in progress'], 422);
        }

        $result = OtpService::verify($user->email, (string) $request->input('code'));

        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        // mark email as verified if needed
        if (! $user->email_verified_at) {
            $user->email_verified_at = Carbon::now();
            $user->save();
        }

        // set session flag — required by PendingLoginController::completeLogin
        $request->session()->put('two_factor_verified', true);

        return response()->json(['message' => 'Verified']);
    }
}
