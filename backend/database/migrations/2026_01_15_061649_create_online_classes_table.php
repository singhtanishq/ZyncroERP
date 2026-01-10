<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('online_classes', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('description')->nullable();

            $table->dateTime('start_datetime');

            $table->boolean('is_recurring')->default(false);
            $table->json('recurring_days')->nullable();

            $table->enum('platform', ['zoom', 'teams', 'gmeet', 'other']);
            $table->string('platform_name')->nullable();

            $table->string('meeting_link')->nullable();
            $table->string('meeting_id')->nullable();
            $table->string('meeting_password')->nullable();

            $table->text('remarks')->nullable();

            $table->enum('status', [
                'scheduled',
                'live',
                'completed',
                'cancelled'
            ])->default('scheduled');

            $table->foreignId('created_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_classes');
    }
};
