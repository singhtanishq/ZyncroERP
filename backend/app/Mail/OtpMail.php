<?php

namespace App\Mail;

class OtpMail extends ZyncroMail
{
    public function __construct(
        protected string $username,
        protected string $otp,
    ) {}

    protected function subjectLine(): string
    {
        return 'Your Zyncro ERP verification code';
    }

    protected function bladeView(): string
    {
        return 'emails.otp';
    }

    protected function viewData(): array
    {
        return [
            'username' => $this->username,
            'otp' => $this->otp,
        ];
    }
}
