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
        Schema::create('students', function (Blueprint $table) {
            // id: bigint(20) unsigned, auto_increment, Primary Key
            $table->id(); 
            
            // user_id: bigint(20) unsigned, Unique Key
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();

            // sid: char(8), Unique Key
            $table->char('sid', 8)->unique();
            
            // course_id: bigint(20) unsigned, Nullable, Multiple/Index Key
            $table->unsignedBigInteger('course_id')->nullable()->index();
            
            // batch_id: bigint(20) unsigned, Nullable, Multiple/Index Key
            $table->unsignedBigInteger('batch_id')->nullable()->index();
            
            // admission_date: date, Nullable
            $table->date('admission_date')->nullable();

            // created_at & updated_at: timestamp, Nullable
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};