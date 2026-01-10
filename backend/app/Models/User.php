<?php

namespace App\Models;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'approve_status',
        'dob',
        'country',
        'mobile',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'dob' => 'date',
            'approve_status' => 'boolean',
            'password' => 'hashed',
        ];
    }
    
    public function verifiedDocuments()
    {
        return $this->hasMany(StudentDocument::class, 'verified_by');
    }

    public function faculty(): HasOne
    {
        return $this->hasOne(Faculty::class);
    }

    /**
     * The franchise owned by this user (role: franchise).
     */
    public function franchise(): HasOne
    {
        return $this->hasOne(Franchise::class);
    }

    /**
     * The corporate employee profile linked to this user (role: employee).
     */
    public function corporateEmployee(): HasOne
    {
        return $this->hasOne(CorporateEmployee::class);
    }
}
