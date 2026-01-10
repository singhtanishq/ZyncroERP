<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('online_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('online_classes', 'end_datetime')) {
                $table->dateTime('end_datetime')->nullable()->after('start_datetime');
            }

            if (!Schema::hasColumn('online_classes', 'duration_minutes')) {
                $table->integer('duration_minutes')->nullable()->after('end_datetime');
            }

            $table->index('start_datetime');
            $table->index('end_datetime');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('online_classes', function (Blueprint $table) {
            $table->dropIndex(['start_datetime']);
            $table->dropIndex(['end_datetime']);
            $table->dropIndex(['status']);

            if (Schema::hasColumn('online_classes', 'duration_minutes')) {
                $table->dropColumn('duration_minutes');
            }

            if (Schema::hasColumn('online_classes', 'end_datetime')) {
                $table->dropColumn('end_datetime');
            }
        });
    }
};
