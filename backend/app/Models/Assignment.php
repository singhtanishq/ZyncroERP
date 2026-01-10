<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'course_id',
        'batch_id',
        'title',
        'question',
        'assignment_link',
        'assignment_file',
        'deadline',
        'status',
        'created_by',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function course()
    {
        return $this->belongsTo(
            Course::class
        );
    }

    public function batch()
    {
        return $this->belongsTo(
            Batch::class
        );
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function submissions()
    {
        return $this->hasMany(
            AssignmentSubmission::class
        );
    }
}