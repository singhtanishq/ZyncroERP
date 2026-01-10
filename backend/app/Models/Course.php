<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'amount',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /* ===================== Relationships ===================== */

    public function batches()
    {
        return $this->hasMany(Batch::class);
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
