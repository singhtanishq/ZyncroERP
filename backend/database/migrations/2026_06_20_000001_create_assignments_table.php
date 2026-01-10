<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('course_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('batch_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');

            $table->longText('question');

            $table->string('assignment_link')
                ->nullable();

            $table->string('assignment_file')
                ->nullable();

            $table->dateTime('deadline');

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};