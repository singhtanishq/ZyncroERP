<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyMaterialAccess extends Model
{
    use HasFactory;

    protected $table = 'study_material_access';

    protected $fillable = [
        'study_material_id',
        'access_type',
        'course_id',
        'batch_id',
    ];

    /* ================= RELATIONS ================= */

    public function material()
    {
        return $this->belongsTo(StudyMaterial::class);
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
