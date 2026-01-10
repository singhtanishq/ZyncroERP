<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {

            if (!Schema::hasColumn('student_documents', 'remarks')) {
                $table->text('remarks')->nullable()->after('verified_by');
            }

        });

        DB::statement("
            ALTER TABLE student_documents
            ADD UNIQUE KEY student_document_unique
            (student_id, document_type)
        ");
    }

    public function down(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {

            if (Schema::hasColumn('student_documents', 'remarks')) {
                $table->dropColumn('remarks');
            }

        });

        DB::statement("
            ALTER TABLE student_documents
            DROP INDEX student_document_unique
        ");
    }
};