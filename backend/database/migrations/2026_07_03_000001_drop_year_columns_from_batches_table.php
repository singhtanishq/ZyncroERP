<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table) {

            $table->dropColumn([
                'start_year',
                'end_year',
            ]);

        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {

            $table->unsignedSmallInteger('start_year')
                ->after('name');

            $table->unsignedSmallInteger('end_year')
                ->after('start_year');

        });
    }
};