<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
        $table->id();

        $table->morphs('certifiable'); 

        // Certificate category
        $table->string('type'); 

        // Optional relations (nullable for flexibility)
        $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('batch_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('exam_id')->nullable()->constrained()->nullOnDelete();

        // Evaluation
        $table->string('status')->default('pending'); 

        $table->decimal('score', 5, 2)->nullable();

        // Certificate meta
        $table->string('certificate_number')->unique();
        $table->timestamp('issued_at')->nullable();

        $table->foreignId('issued_by')
            ->nullable()
            ->constrained('users')
            ->nullOnDelete();

        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
