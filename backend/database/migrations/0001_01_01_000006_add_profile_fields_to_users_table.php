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
        Schema::table('users', function (Blueprint $table) {
            // Date of birth — nullable for existing users
            $table->date('dob')->nullable()->after('email_verified_at');

            // Country name — keep it simple string
            $table->string('country', 100)->nullable()->after('dob');

            // Mobile number as string (can include +, spaces, etc.)
            $table->string('mobile', 20)->nullable()->after('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['dob', 'country', 'mobile']);
        });
    }
};
