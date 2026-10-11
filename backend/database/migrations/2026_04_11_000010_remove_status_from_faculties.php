<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // sqlite keeps the status index alive after dropColumn and then
        // errors on every write — drop it explicitly first.
        if (DB::connection()->getDriverName() === 'sqlite'
            && Schema::hasIndex('faculties', 'faculties_status_index')) {
            Schema::table('faculties', function (Blueprint $table) {
                $table->dropIndex('faculties_status_index');
            });
        }

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active');
        });
    }
};