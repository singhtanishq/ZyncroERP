<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentIdCard extends Model
{
    protected $fillable = [
        'student_id',
        'expiry_date',
        'activated_at',
        'qr_token',
        'public_token',
    ];

    protected $casts = [
        'expiry_date'  => 'date',
        'activated_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
