<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacultyAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'course_id',
        'batch_id',
    ];

    /* ===================== Relationships ===================== */

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}