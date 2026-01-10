<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = [
        'certifiable_id',
        'certifiable_type',
        'type',
        'course_id',
        'batch_id',
        'exam_id',
        'status',
        'score',
        'certificate_number',
        'issued_at',
        'issued_by',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function certifiable()
    {
        return $this->morphTo();
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}