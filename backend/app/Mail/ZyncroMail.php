<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Base mail for all Zyncro ERP transactional emails.
 *
 * Emails are provider-independent: the transport (SMTP/log/etc.) is chosen
 * through the MAIL_MAILER configuration, never in code.
 */
abstract class ZyncroMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Shared variables available to every email view.
     */
    protected function baseViewData(): array
    {
        return [
            'logoUrl' => rtrim((string) config('app.url'), '/') . '/images/logo_color.png',
            'supportEmail' => (string) config('mail.support_email'),
        ];
    }

    abstract protected function subjectLine(): string;

    abstract protected function bladeView(): string;

    abstract protected function viewData(): array;

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: $this->bladeView(),
            with: array_merge($this->baseViewData(), $this->viewData()),
        );
    }
}
