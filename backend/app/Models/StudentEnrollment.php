<?php

namespace App\Models;

use App\Models\StudentDocument;
use Illuminate\Database\Eloquent\Model;

class StudentEnrollment extends Model
{
    protected $fillable = [
        'student_id',
        'course_id',
        'batch_id',
        'joined_at',
        'completion_date',
        'status',
        'payment_status',
        'remarks',
    ];

    protected $casts = [
        'joined_at'       => 'date',
        'completion_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
    
    public function enrollmentDocuments()
    {
        return $this->hasMany(
            StudentDocument::class,
            'enrollment_id'
        );
    }
    
    public function documents()
    {
        return $this->hasMany(
            StudentDocument::class,
            'enrollment_id'
        );
    }

}