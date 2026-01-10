<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Company-wide announcements published by the administration and read
     * by employees in their dashboard.
     */
    public function up(): void
    {
        Schema::create('corporate_announcements', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('body');

            $table->enum('status', ['active', 'inactive'])->default('active')->index();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('corporate_announcements');
    }
};
