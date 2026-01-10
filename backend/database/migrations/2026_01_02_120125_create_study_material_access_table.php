<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_material_access', function (Blueprint $table) {
            $table->id();

            $table->foreignId('study_material_id')
                  ->constrained('study_materials')
                  ->cascadeOnDelete();

            $table->enum('access_type', ['all', 'course', 'batch']);

            $table->foreignId('course_id')
                  ->nullable()
                  ->constrained('courses')
                  ->cascadeOnDelete();

            $table->foreignId('batch_id')
                  ->nullable()
                  ->constrained('batches')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_material_access');
    }
};

