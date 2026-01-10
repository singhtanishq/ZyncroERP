<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_submissions', function (Blueprint $table) {

            $table->id();

            $table->foreignId('assignment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('student_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->text('response_link')
                ->nullable();

            $table->string('response_file')
                ->nullable();

            $table->dateTime('submitted_at');

            $table->timestamps();

            $table->unique([
                'assignment_id',
                'student_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'assignment_submissions'
        );
    }
};