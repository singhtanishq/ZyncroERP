<?php

namespace App\Services;

use App\Models\OtpCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Single implementation of the OTP lifecycle used by every flow
 * (login, registration, password reset, profile change):
 *
 *  - cryptographically random 6-digit codes
 *  - codes stored hashed only
 *  - previous unused codes invalidated whenever a new one is issued
 *  - per-email resend cooldown and hourly request cap
 *  - configurable expiry and per-code attempt limit (codes lock)
 */
class OtpService
{
    /**
     * Issue a new OTP for an email. Returns:
     *   ['ok' => true, 'otp' => string, 'expires_at' => Carbon]
     *   ['ok' => false, 'message' => string, 'retry_after' => ?int]
     */
    public static function issue(string $email, ?int $userId = null): array
    {
        $email = Str::lower($email);

        $cooldown = (int) config('otp.resend_cooldown_seconds');
        $cooldownKey = 'otp-resend:' . $email;

        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            return [
                'ok' => false,
                'message' => 'Please wait before requesting another code.',
                'retry_after' => RateLimiter::availableIn($cooldownKey),
            ];
        }

        $hourlyKey = 'otp-hourly:' . $email;
        $hourlyMax = (int) config('otp.max_requests_per_hour');

        if (RateLimiter::tooManyAttempts($hourlyKey, $hourlyMax)) {
            return [
                'ok' => false,
                'message' => 'Too many codes requested. Try again later.',
                'retry_after' => RateLimiter::availableIn($hourlyKey),
            ];
        }

        // Invalidate any previous unused codes for this email.
        OtpCode::where('email', $email)
            ->where('used', false)
            ->update(['used' => true]);

        $otp = (string) random_int(100000, 999999);

        $code = OtpCode::create([
            'user_id' => $userId,
            'email' => $email,
            'code_hash' => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes((int) config('otp.expiration_minutes')),
            'used' => false,
            'attempts' => 0,
        ]);

        RateLimiter::hit($cooldownKey, $cooldown);
        RateLimiter::hit($hourlyKey, 3600);

        return [
            'ok' => true,
            'otp' => $otp,
            'expires_at' => $code->expires_at,
        ];
    }

    /**
     * Verify a code for an email. Returns:
     *   ['ok' => true, 'otp' => OtpCode]
     *   ['ok' => false, 'message' => string, 'status' => int]
     */
    public static function verify(string $email, string $code): array
    {
        $email = Str::lower($email);

        $otp = OtpCode::where('email', $email)
            ->where('used', false)
            ->orderByDesc('id')
            ->first();

        if (! $otp) {
            return ['ok' => false, 'message' => 'Invalid or expired code', 'status' => 422];
        }

        if ($otp->isExpired()) {
            $otp->update(['used' => true]);

            return ['ok' => false, 'message' => 'Code expired', 'status' => 422];
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            $maxAttempts = (int) config('otp.max_attempts');

            if ($otp->attempts >= $maxAttempts) {
                // Lock the code after too many wrong guesses.
                $otp->update(['used' => true]);

                return [
                    'ok' => false,
                    'message' => 'Too many invalid attempts. Request a new code.',
                    'status' => 429,
                ];
            }

            return ['ok' => false, 'message' => 'Invalid code', 'status' => 422];
        }

        $otp->update(['used' => true]);

        return ['ok' => true, 'otp' => $otp];
    }
}
