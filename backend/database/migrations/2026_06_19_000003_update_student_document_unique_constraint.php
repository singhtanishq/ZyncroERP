<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE student_documents
            DROP INDEX student_document_unique
        ");

        DB::statement("
            ALTER TABLE student_documents
            ADD UNIQUE KEY student_document_unique
            (
                enrollment_id,
                document_type
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE student_documents
            DROP INDEX student_document_unique
        ");

        DB::statement("
            ALTER TABLE student_documents
            ADD UNIQUE KEY student_document_unique
            (
                student_id,
                document_type
            )
        ");
    }
};