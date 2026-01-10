<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('course_certificates', function (Blueprint $table) {
            $table->unique(['student_id', 'exam_id'], 'course_cert_student_exam_unique');
        });
    }

    public function down(): void
    {
        Schema::table('course_certificates', function (Blueprint $table) {
            $table->dropUnique('course_cert_student_exam_unique');
        });
    }
};
