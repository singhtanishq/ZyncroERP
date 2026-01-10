<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_salary_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('faculty_id')
                  ->constrained('faculties')
                  ->cascadeOnDelete();

            $table->string('month'); // YYYY-MM
            $table->decimal('amount', 10, 2);

            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');

            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->unique(['faculty_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_salary_records');
    }
};