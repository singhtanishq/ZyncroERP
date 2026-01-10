<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Safety Check
        |--------------------------------------------------------------------------
        |
        | Since faculty assignments are now always batch-based,
        | prevent migration if any legacy records still have NULL batch_id.
        |
        */

        $nullAssignments = DB::table('faculty_assignments')
            ->whereNull('batch_id')
            ->count();

        if ($nullAssignments > 0) {
            throw new RuntimeException(
                "Migration aborted. {$nullAssignments} faculty assignment(s) still have NULL batch_id."
            );
        }

        Schema::table('faculty_assignments', function (Blueprint $table) {

            $table->dropForeign(['batch_id']);
        
        });
        
        Schema::table('faculty_assignments', function (Blueprint $table) {
        
            $table->unsignedBigInteger('batch_id')
                ->nullable(false)
                ->change();
        
        });
        
        Schema::table('faculty_assignments', function (Blueprint $table) {
        
            $table->foreign('batch_id')
                ->references('id')
                ->on('batches')
                ->cascadeOnDelete();
        
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculty_assignments', function (Blueprint $table) {

            $table->dropForeign(['batch_id']);
        
        });
        
        Schema::table('faculty_assignments', function (Blueprint $table) {
        
            $table->unsignedBigInteger('batch_id')
                ->nullable()
                ->change();
        
        });
        
        Schema::table('faculty_assignments', function (Blueprint $table) {
        
            $table->foreign('batch_id')
                ->references('id')
                ->on('batches')
                ->nullOnDelete();
        
        });
    }
};