<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('franchise_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('franchise_id')
                  ->constrained('franchises')
                  ->cascadeOnDelete();

            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);

            $table->enum('status', ['pending', 'partial', 'paid'])
                  ->default('pending');

            $table->timestamps();

            $table->index('franchise_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('franchise_payments');
    }
};