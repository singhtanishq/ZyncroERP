<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('description')->nullable();

            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();

            $table->string('exam_category'); // Assessment, Final, Mock, Custom etc

            $table->dateTime('start_time');
            $table->integer('duration_minutes');
            $table->dateTime('end_time');

            $table->enum('mode', ['online', 'offline']);

            // Online
            $table->string('platform_name')->nullable();
            $table->text('platform_description')->nullable();
            $table->text('exam_link')->nullable();

            // Offline
            $table->string('center_name')->nullable();
            $table->text('offline_notes')->nullable();

            $table->enum('status', [
                'upcoming',
                'live',
                'past',
                'cancelled'
            ])->default('upcoming');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
