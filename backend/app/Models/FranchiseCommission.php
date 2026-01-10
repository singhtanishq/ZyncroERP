<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranchiseCommission extends Model
{
    protected $table = 'franchise_commissions';

    protected $fillable = ['commission'];

    protected $casts = [
        'commission' => 'decimal:2',
    ];
}