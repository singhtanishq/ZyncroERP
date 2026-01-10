<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentDocument extends Model
{
    protected $fillable = [
        'student_id',
        'enrollment_id',
        'document_type',
        'file_path',
        'verification_status',
        'verified_by',
        'verified_at',
        'remarks',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function enrollment()
    {
        return $this->belongsTo(
            StudentEnrollment::class,
            'enrollment_id'
        );
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}