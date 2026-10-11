<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class HookDebugTest extends TestCase
{
    use RefreshDatabase;

    public function test_hook_debug(): void
    {
        dump([
            'driver' => config('database.connections.payments_db.driver'),
            'has_payments' => Schema::connection('payments_db')->hasTable('payments'),
            'count' => \App\Models\Payment::count(),
        ]);
        $this->assertTrue(true);
    }
}
