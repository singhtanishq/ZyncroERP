<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {

            if (!Schema::hasColumn('student_documents', 'remarks')) {
                $table->text('remarks')->nullable()->after('verified_by');
            }

        });

        Schema::table('student_documents', function (Blueprint $table) {
            $table->unique(['student_id', 'document_type'], 'student_document_unique');
        });
    }

    public function down(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            $table->dropUnique('student_document_unique');
        });

        Schema::table('student_documents', function (Blueprint $table) {

            if (Schema::hasColumn('student_documents', 'remarks')) {
                $table->dropColumn('remarks');
            }

        });
    }
};
