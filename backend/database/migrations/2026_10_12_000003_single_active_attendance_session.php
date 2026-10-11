<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Guarantees at most ONE active attendance session per (course, batch):
 * active_lock is 1 while a session is live and NULL once expired — NULLs
 * never collide in a unique index, so history is unaffected.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->unsignedTinyInteger('active_lock')->nullable()->after('status');
        });

        DB::table('attendance_sessions')
            ->where('status', 'active')
            ->update(['active_lock' => 1]);

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->unique(['course_id', 'batch_id', 'active_lock'], 'attendance_sessions_active_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropUnique('attendance_sessions_active_unique');
            $table->dropColumn('active_lock');
        });
    }
};
