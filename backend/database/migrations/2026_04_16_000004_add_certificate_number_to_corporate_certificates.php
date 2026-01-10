<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('corporate_certificates', function (Blueprint $table) {
            $table->string('certificate_number')->unique()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('corporate_certificates', function (Blueprint $table) {
            $table->dropUnique(['certificate_number']);
            $table->dropColumn('certificate_number');
        });
    }
};