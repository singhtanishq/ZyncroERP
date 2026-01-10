<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('course_certificates', function (Blueprint $table) {
            // drop old course-level uniqueness
            $table->dropUnique(['student_id', 'course_id', 'batch_id']);

            // enforce exam-based uniqueness
            $table->unique(['student_id', 'exam_id']);
        });
    }

    public function down(): void
    {
        Schema::table('course_certificates', function (Blueprint $table) {
            $table->dropUnique(['student_id', 'exam_id']);
            $table->unique(['student_id', 'course_id', 'batch_id']);
        });
    }
};
