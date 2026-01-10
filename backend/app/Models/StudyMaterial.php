<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudyMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'description',
        'notes',
        'file_path',
        'video_url',
        'status',
        'created_by',
    ];

    /* ---------- RELATIONS ---------- */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function accessRules()
    {
        return $this->hasMany(StudyMaterialAccess::class);
    }
}
