<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentCommunicationAccess extends Model
{
    use HasFactory;

    protected $table = 'student_communication_access';

    protected $fillable = [
        'communication_id',
        'access_type',
        'course_id',
        'batch_id',
    ];

    /* ================= RELATIONSHIPS ================= */

    public function communication()
    {
        return $this->belongsTo(
            StudentCommunication::class,
            'communication_id'
        );
    }

    public function course()
    {
        return $this->belongsTo(
            Course::class
        );
    }

    public function batch()
    {
        return $this->belongsTo(
            Batch::class
        );
    }
}