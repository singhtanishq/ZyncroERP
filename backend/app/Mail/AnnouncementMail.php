<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Admin bulk communication. The body is admin-authored rich HTML sent as-is,
 * matching the previous behaviour of the raw email transport.
 */
class AnnouncementMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        protected string $mailSubject,
        protected string $htmlContent,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function build(): self
    {
        return $this->html($this->htmlContent);
    }
}
