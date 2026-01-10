<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow enrollments to record partially-paid fees distinctly from
     * fees awaiting verification / fully paid fees.
     */
    public function up(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'verification_pending', 'partial', 'paid'])
                ->default('pending')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'verification_pending', 'paid'])
                ->default('pending')
                ->change();
        });
    }
};
