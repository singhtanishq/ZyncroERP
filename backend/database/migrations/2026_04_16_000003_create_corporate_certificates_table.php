<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('corporate_certificates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                  ->constrained('corporate_employees')
                  ->onDelete('cascade');

            $table->string('certificate_name');
            $table->date('issued_date');
            $table->string('certificate_file')->nullable(); // PDF path

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corporate_certificates');
    }
};