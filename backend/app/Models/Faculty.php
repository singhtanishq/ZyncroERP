<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faculty extends Model
{
    use HasFactory;

    /**
     * Table name (optional if following convention)
     */
    protected $table = 'faculties';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'user_id',
        'franchise_id',
        'name',
        'code',
        'phone',
        'email',
        'qualification',
        'specialization',
        'join_date',
    ];

    /**
     * Attribute casting
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function franchise(): BelongsTo
    {
        return $this->belongsTo(Franchise::class);
    }
    
    public function assignments()
    {
        return $this->hasMany(FacultyAssignment::class);
    }

}