<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Carbon\Carbon;

class OnlineClass extends Model
{
    protected $table = 'online_classes';

    protected $fillable = [
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'duration_minutes',
        'is_recurring',
        'recurring_days',
        'platform',
        'platform_name',
        'meeting_link',
        'meeting_id',
        'meeting_password',
        'remarks',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_datetime'    => 'datetime',
        'end_datetime'      => 'datetime',
        'duration_minutes' => 'integer',
        'is_recurring'      => 'boolean',
        'recurring_days'    => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function accessRules()
    {
        return $this->hasMany(OnlineClassAccess::class);
    }

    public function isUpcoming(): bool
    {
        if (!$this->start_datetime) {
            return false;
        }

        return now()->lt($this->start_datetime);
    }

    public function isLive(): bool
    {
        if (!$this->start_datetime || !$this->end_datetime) {
            return false;
        }

        return now()->between(
            Carbon::parse($this->start_datetime),
            Carbon::parse($this->end_datetime)
        );
    }

    public function isPast(): bool
    {
        if ($this->end_datetime) {
            return now()->gt($this->end_datetime);
        }

        return $this->start_datetime
            ? now()->gt($this->start_datetime)
            : false;
    }

    public function syncStatus(): void
    {
        $newStatus = 'scheduled';

        if ($this->isLive()) {
            $newStatus = 'live';
        } elseif ($this->isPast()) {
            $newStatus = 'completed';
        }

        if ($this->status !== $newStatus) {
            $this->status = $newStatus;
            $this->saveQuietly();
        }
    }
}
