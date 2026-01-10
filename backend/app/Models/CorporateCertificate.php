<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorporateCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'certificate_name',
        'issued_date',
        'certificate_file'
    ];

    public function employee()
    {
        return $this->belongsTo(CorporateEmployee::class, 'employee_id');
    }
    
    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($model) {
            $model->certificate_number =
                'CERT-' . date('Y') . '-' . strtoupper(uniqid());
        });
    }
}