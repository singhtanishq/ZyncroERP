<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnlineClassAccess extends Model
{
    protected $table = 'online_class_access';

    protected $fillable = [
        'online_class_id',
        'access_type',
        'course_id',
        'batch_id',
    ];

    /* ================= RELATIONS ================= */

    public function onlineClass()
    {
        return $this->belongsTo(OnlineClass::class);
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
