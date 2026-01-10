<?php

namespace App\Models;

use App\Enums\ExamStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'course_id',
        'batch_id',
        'exam_category',
        'start_time',
        'duration_minutes',
        'end_time',
        'mode',
        'platform_name',
        'platform_description',
        'exam_link',
        'center_name',
        'offline_notes',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
        'status'     => ExamStatus::class,
    ];

    // Relations
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function results()
    {
        return $this->hasMany(ExamResult::class);
    }

    public function admitCards()
    {
        return $this->hasMany(AdmitCard::class);
    }
}
