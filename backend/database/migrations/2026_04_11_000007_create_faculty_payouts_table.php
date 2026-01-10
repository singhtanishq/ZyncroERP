<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_payouts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('faculty_id')
                  ->constrained('faculties')
                  ->cascadeOnDelete();

            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);

            $table->enum('status', ['pending', 'partial', 'paid'])
                  ->default('pending');

            $table->timestamps();

            $table->index('faculty_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_payouts');
    }
};