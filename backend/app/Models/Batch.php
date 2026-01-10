<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'status'     => 'string',
    ];

    /* ===================== Relationships ===================== */

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
    
    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }
    
    public function assignments()
    {
        return $this->hasMany(
            Assignment::class
        );
    }
    
    public function facultyAssignments()
    {
        return $this->hasMany(FacultyAssignment::class);
    }
}
