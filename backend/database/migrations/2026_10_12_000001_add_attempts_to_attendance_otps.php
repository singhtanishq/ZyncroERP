<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('attendance_otps', function (Blueprint $table) {
            $table->unsignedInteger('attempts')->default(0)->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_otps', function (Blueprint $table) {
            $table->dropColumn('attempts');
        });
    }
};
