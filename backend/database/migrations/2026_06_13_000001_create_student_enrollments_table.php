<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('student_id')
                ->constrained('students')
                ->cascadeOnDelete();

            $table->foreignId('course_id')
                ->constrained('courses')
                ->cascadeOnDelete();

            $table->foreignId('batch_id')
                ->nullable()
                ->constrained('batches')
                ->nullOnDelete();

            $table->date('joined_at')->nullable();

            $table->enum('status', [
                'pending',
                'active',
                'completed',
                'cancelled',
            ])->default('pending');

            $table->enum('payment_status', [
                'pending',
                'verification_pending',
                'paid',
            ])->default('pending');

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index('student_id');
            $table->index('course_id');
            $table->index('batch_id');
            $table->index('status');
            $table->index('payment_status');

            $table->unique([
                'student_id',
                'course_id',
                'batch_id'
            ], 'student_course_batch_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};