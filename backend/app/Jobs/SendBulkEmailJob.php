<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\EmailLog;
use App\Mail\AnnouncementMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendBulkEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var array<int> Seconds between retry attempts. */
    public array $backoff = [30, 120];

    protected $userId;
    protected $subject;
    protected $content;

    public function __construct($userId, $subject, $content)
    {
        $this->userId = $userId;
        $this->subject = $subject;
        $this->content = $content;
    }

    public function handle(): void
    {
        $user = User::find($this->userId);

        if (!$user) return;

        try {
            Mail::to($user->email, $user->name)
                ->send(new AnnouncementMail($this->subject, $this->content));

            EmailLog::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'subject' => $this->subject,
                'content' => $this->content,
                'status' => true,
            ]);
        } catch (Throwable $e) {
            Log::warning('Bulk email send failed', [
                'user_id' => $user->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            // Rethrow so the queue can retry with backoff.
            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        $user = User::find($this->userId);

        if (!$user) return;

        EmailLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'subject' => $this->subject,
            'content' => $this->content,
            'status' => false,
        ]);
    }
}
