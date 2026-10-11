<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * student_fees holds one row per (student, course) — the fee controllers
 * and enrollment flows assume that pairing, so it is now enforced at the
 * database level. Any historical duplicates are collapsed first.
 */
return new class extends Migration {
    public function up(): void
    {
        // MySQL 1093 workaround: the dedupe target is wrapped in a derived table.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement(
                'DELETE FROM student_fees WHERE id IN (
                    SELECT dup_id FROM (
                        SELECT dup.id AS dup_id
                        FROM student_fees dup
                        JOIN student_fees keep_row
                            ON keep_row.student_id = dup.student_id
                            AND keep_row.course_id = dup.course_id
                            AND keep_row.id < dup.id
                    ) AS duplicates
                )'
            );
        } else {
            // Portable version (sqlite / pgsql).
            DB::statement(
                'DELETE FROM student_fees WHERE id IN (
                    SELECT dup.id FROM student_fees dup
                    JOIN student_fees keep_row
                        ON keep_row.student_id = dup.student_id
                        AND keep_row.course_id = dup.course_id
                        AND keep_row.id < dup.id
                )'
            );
        }

        Schema::table('student_fees', function (Blueprint $table) {
            $table->unique(['student_id', 'course_id'], 'student_fees_student_course_unique');
        });
    }

    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropUnique('student_fees_student_course_unique');
        });
    }
};
