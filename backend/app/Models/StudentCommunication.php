<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentCommunication extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'status',
        'created_by',
    ];

    /* ================= RELATIONSHIPS ================= */

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function accessRules()
    {
        return $this->hasMany(
            StudentCommunicationAccess::class,
            'communication_id'
        );
    }
}