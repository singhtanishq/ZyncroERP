<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Schema;

abstract class TestCase extends BaseTestCase
{
    /**
     * The payments ledger lives on its own connection. On sqlite (test
     * mode) it must be dropped before migrate:fresh re-runs the ledger
     * migration, otherwise the second test class hits "table already
     * exists" on a database migrate:fresh never resets.
     */
    protected function refreshTestDatabase()
    {
        if (config('database.connections.payments_db.driver') === 'sqlite') {
            Schema::connection('payments_db')->dropIfExists('payments');
        }

        parent::refreshTestDatabase();
    }
}
