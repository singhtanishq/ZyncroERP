<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorporateEmployee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'email',
        'phone',
        'role_id',
        'user_id',
        'department',
        'joining_date',
        'status'
    ];

    public function role()
    {
        return $this->belongsTo(CorporateRole::class, 'role_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function certificates()
    {
        return $this->hasMany(CorporateCertificate::class, 'employee_id');
    }
}