<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorporateAnnouncement extends Model
{
    protected $fillable = [
        'title',
        'body',
        'status',
        'created_by',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
