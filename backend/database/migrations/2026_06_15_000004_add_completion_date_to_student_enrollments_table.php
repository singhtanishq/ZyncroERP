<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table) {

            $table->date('completion_date')
                ->nullable()
                ->after('joined_at');

        });
    }

    public function down(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table) {

            $table->dropColumn('completion_date');

        });
    }
};