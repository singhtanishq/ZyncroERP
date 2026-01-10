<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('attendance_session_id');
            $table->unsignedBigInteger('student_id');

            $table->timestamp('marked_at');
            $table->enum('status', ['present'])->default('present');

            $table->timestamps();

            $table->unique(['attendance_session_id', 'student_id']);

            $table->foreign('attendance_session_id')
                  ->references('id')
                  ->on('attendance_sessions')
                  ->cascadeOnDelete();

            $table->foreign('student_id')
                  ->references('id')
                  ->on('students')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
