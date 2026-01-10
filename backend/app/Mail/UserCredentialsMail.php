<?php

namespace App\Mail;

class UserCredentialsMail extends ZyncroMail
{
    public function __construct(
        protected string $name,
        protected string $email,
        protected string $password,
        protected string $role = 'User',
    ) {}

    protected function subjectLine(): string
    {
        return 'Your Zyncro ERP login credentials';
    }

    protected function bladeView(): string
    {
        return 'emails.user-credentials';
    }

    protected function viewData(): array
    {
        return [
            'name' => $this->name,
            'role' => ucfirst($this->role),
            'email' => $this->email,
            'password' => $this->password,
        ];
    }
}
