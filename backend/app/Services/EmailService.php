<?php

namespace App\Services;

use App\Mail\AnnouncementMail;
use App\Mail\OtpMail;
use App\Mail\StudentCredentialsMail;
use App\Mail\UserCredentialsMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Application-level email API.
 *
 * Business code calls this service; the delivery transport is chosen purely
 * through configuration (MAIL_MAILER + MAIL_HOST etc.), so the provider can
 * be swapped without touching application logic.
 */
class EmailService
{
    /**
     * Send a one-time password email.
     */
    public function otp(string $to, string $name, string $otp): array
    {
        return $this->send(
            $to,
            $name,
            new OtpMail($name, $otp),
            'OTP email'
        );
    }

    /**
     * Send student login credentials.
     */
    public function studentCredentials(string $to, string $studentName, string $plainPassword): array
    {
        return $this->send(
            $to,
            $studentName,
            new StudentCredentialsMail($studentName, $to, $plainPassword),
            'Student credentials email'
        );
    }

    /**
     * Send login credentials for any staff/other role.
     */
    public function userCredentials(string $to, string $name, string $plainPassword, string $role = 'user'): array
    {
        return $this->send(
            $to,
            $name,
            new UserCredentialsMail($name, $to, $plainPassword, $role),
            'User credentials email'
        );
    }

    /**
     * Send an ad-hoc announcement (admin bulk email).
     */
    public function announcement(string $to, ?string $name, string $subject, string $htmlContent): array
    {
        return $this->send(
            $to,
            $name,
            new AnnouncementMail($subject, $htmlContent),
            'Announcement email'
        );
    }

    /**
     * Never let a mail failure break the surrounding business operation:
     * callers decide how to react to the returned status.
     */
    protected function send(string $to, ?string $name, object $mailable, string $label): array
    {
        try {
            Mail::to($to, $name !== '' ? $name : null)->send($mailable);

            return ['ok' => true];
        } catch (Throwable $e) {
            Log::error("{$label} failed", [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
