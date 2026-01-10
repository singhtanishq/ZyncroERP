<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links the supporting role profiles to real user accounts so the
 * Franchise and Employee dashboards can be scoped per user:
 *
 *  - franchises.user_id           → the franchise owner login (role: franchise)
 *  - students.franchise_id        → students enrolled through a franchise
 *  - faculties.franchise_id       → faculty members belonging to a franchise
 *  - corporate_employees.user_id  → the employee's login (role: employee)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('franchises', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->constrained('users')
                ->nullOnDelete();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('franchise_id')
                ->nullable()
                ->after('user_id')
                ->constrained('franchises')
                ->nullOnDelete();
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->foreignId('franchise_id')
                ->nullable()
                ->after('user_id')
                ->constrained('franchises')
                ->nullOnDelete();
        });

        Schema::table('corporate_employees', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->after('role_id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('corporate_employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('franchise_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('franchise_id');
        });

        Schema::table('franchises', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
