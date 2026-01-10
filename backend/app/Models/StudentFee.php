<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentFee extends Model
{
    protected $table = 'student_fees';

    protected $fillable = [
        'student_id',
        'course_id',
        'batch_id',
        'total_fees',
        'paid_fees',
        'status',
    ];

    protected $casts = [
        'total_fees' => 'decimal:2',
        'paid_fees' => 'decimal:2',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

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
}