<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('batch_id');

            $table->date('session_date');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');

            $table->string('qr_token')->unique();

            $table->unsignedBigInteger('created_by'); // admin id
            $table->enum('status', ['active', 'expired'])->default('active');

            $table->timestamps();

            $table->index(['course_id', 'batch_id', 'session_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
