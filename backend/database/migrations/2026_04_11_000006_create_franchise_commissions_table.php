<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('franchise_commissions', function (Blueprint $table) {
            $table->id();
            $table->decimal('commission', 5, 2)->default(0); // % value
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('franchise_commissions');
    }
};