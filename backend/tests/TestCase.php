<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\File;

abstract class TestCase extends BaseTestCase
{
    /**
     * Set once per PHPUnit process after the payments ledger file has been
     * reset (the ledger lives on its own sqlite connection that neither
     * migrate:fresh nor the per-test transaction rollback touches).
     */
    protected static bool $ledgerReset = false;

    protected function setUp(): void
    {
        // Runs before the app boots — no container helpers yet, so the
        // ledger path is resolved relative to this file (backend/tests/).
        $ledger = __DIR__ . '/../database/testing-payments.sqlite';

        if (! static::$ledgerReset && file_exists(dirname($ledger))) {
            if (is_file($ledger)) {
                unlink($ledger);
            }
            file_put_contents($ledger, '');

            static::$ledgerReset = true;
        }

        parent::setUp();
    }
}
