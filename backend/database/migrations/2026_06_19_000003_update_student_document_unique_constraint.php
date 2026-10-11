<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Re-scopes the document uniqueness constraint: proofs and documents are
 * unique per (enrollment, type) rather than per student.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            $table->dropUnique('student_document_unique');
        });

        Schema::table('student_documents', function (Blueprint $table) {
            $table->unique(['enrollment_id', 'document_type'], 'student_document_unique');
        });
    }

    public function down(): void
    {
        Schema::table('student_documents', function (Blueprint $table) {
            $table->dropUnique('student_document_unique');
        });

        Schema::table('student_documents', function (Blueprint $table) {
            $table->unique(['student_id', 'document_type'], 'student_document_unique');
        });
    }
};
