<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_fees', function (Blueprint $table) {
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

            $table->decimal('total_fees', 10, 2)->default(0);
            $table->decimal('paid_fees', 10, 2)->default(0);

            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending');

            $table->timestamps();

            $table->index('student_id');
            $table->index('course_id');
            $table->index('batch_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_fees');
    }
};
