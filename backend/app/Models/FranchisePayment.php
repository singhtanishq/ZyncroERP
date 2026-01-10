<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranchisePayment extends Model
{
    protected $table = 'franchise_payments';

    protected $fillable = [
        'franchise_id',
        'total_amount',
        'paid_amount',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function franchise()
    {
        return $this->belongsTo(Franchise::class);
    }
}