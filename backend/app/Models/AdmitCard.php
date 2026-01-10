<?php

namespace App\Models;

use App\Enums\AdmitCardStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdmitCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'student_id',
        'qr_token',
        'status',
    ];

    protected $casts = [
        'status' => AdmitCardStatus::class,
    ];

    // Relations
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
