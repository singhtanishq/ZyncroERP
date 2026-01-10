<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('online_class_access', function (Blueprint $table) {
            $table->id();

            $table->foreignId('online_class_id')
                  ->constrained('online_classes')
                  ->cascadeOnDelete();

            $table->enum('access_type', ['all', 'course', 'batch']);

            $table->foreignId('course_id')
                  ->nullable()
                  ->constrained('courses')
                  ->nullOnDelete();

            $table->foreignId('batch_id')
                  ->nullable()
                  ->constrained('batches')
                  ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_class_access');
    }
};
