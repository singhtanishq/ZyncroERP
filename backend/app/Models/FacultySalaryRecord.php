<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultySalaryRecord extends Model
{
    protected $table = 'faculty_salary_records';

    protected $fillable = [
        'faculty_id',
        'month',
        'amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}