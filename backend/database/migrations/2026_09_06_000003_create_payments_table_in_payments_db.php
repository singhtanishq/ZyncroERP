<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Creates the payments ledger inside the dedicated payments database
 * (payments_db connection). Previously this schema lived only in an
 * external production database; it is now version-controlled so a local
 * payment database can be provisioned with a clean install.
 */
return new class extends Migration
{
    public function up(): void
    {
        // The ledger lives on a separate connection that migrate:fresh never
        // resets (and sqlite :memory: test connections are recreated per
        // process) — so guard against re-creation.
        if (Schema::connection('payments_db')->hasTable('payments')) {
            return;
        }

        Schema::connection('payments_db')->create('payments', function (Blueprint $table) {
            $table->id();

            $table->string('merchant_txn_no')->nullable()->index();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency', 8)->default('INR');

            $table->string('name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('mobile', 20)->nullable();

            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('pincode', 16)->nullable();

            $table->string('purpose')->nullable();
            $table->text('remarks')->nullable();

            $table->string('payment_link_id')->nullable();
            $table->string('payment_page_id')->nullable();

            $table->string('status')->default('pending')->index();

            $table->timestamp('email_sent_at')->nullable();

            $table->string('pg_txn_id')->nullable();
            $table->string('payment_id')->nullable();
            $table->string('payment_mode')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('payments_db')->dropIfExists('payments');
    }
};
