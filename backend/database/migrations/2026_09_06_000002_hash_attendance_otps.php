<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Attendance OTPs are stored hashed, so the column must fit a hash
     * instead of the raw 6-digit code.
     */
    public function up(): void
    {
        Schema::table('attendance_otps', function (Blueprint $table) {
            $table->string('otp', 255)->change();
        });
    }

    public function down(): void
    {
        Schema::table('attendance_otps', function (Blueprint $table) {
            $table->string('otp', 6)->change();
        });
    }
};
