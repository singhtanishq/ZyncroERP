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
        DB::statement(
            'DELETE sf FROM student_fees sf
             JOIN student_fees keep ON keep.id = (
                 SELECT MIN(id) FROM student_fees
                 WHERE student_id = sf.student_id AND course_id = sf.course_id
             )
             WHERE sf.id > keep.id'
        );

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
