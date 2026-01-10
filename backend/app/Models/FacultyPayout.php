<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyPayout extends Model
{
    protected $table = 'faculty_payouts';

    protected $fillable = [
        'faculty_id',
        'total_amount',
        'paid_amount',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}