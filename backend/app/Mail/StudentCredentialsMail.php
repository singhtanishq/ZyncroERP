<?php

namespace App\Mail;

class StudentCredentialsMail extends ZyncroMail
{
    public function __construct(
        protected string $studentName,
        protected string $email,
        protected string $password,
    ) {}

    protected function subjectLine(): string
    {
        return 'Your Zyncro ERP student login credentials';
    }

    protected function bladeView(): string
    {
        return 'emails.student-credentials';
    }

    protected function viewData(): array
    {
        return [
            'studentName' => $this->studentName,
            'email' => $this->email,
            'password' => $this->password,
        ];
    }
}
