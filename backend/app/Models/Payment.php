<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $connection = 'payments_db'; 

    protected $table = 'payments';

    protected $fillable = [
        'merchant_txn_no',
        'amount',
        'currency',
        'name',
        'email',
        'mobile',
        'country',
        'state',
        'city',
        'address',
        'pincode',
        'purpose',
        'remarks',
        'payment_link_id',
        'payment_page_id',
        'status',
        'email_sent_at',
        'pg_txn_id',
        'payment_id',
        'payment_mode',
    ];
}