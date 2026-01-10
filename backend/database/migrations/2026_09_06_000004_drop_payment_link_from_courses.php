<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The courses.payment_link column pointed students at an external payment
 * portal. The external portal is retired; payments are managed inside the
 * ERP (enrollment -> payment proof -> admin verification -> mark paid).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'payment_link')) {
                $table->dropColumn('payment_link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->text('payment_link')->nullable()->after('amount');
        });
    }
};
