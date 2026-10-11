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
        dump('uses map has RefreshDatabase: ' . var_export(isset(array_flip(class_uses_recursive(static::class))[\Illuminate\Foundation\Testing\RefreshDatabase::class]), true));
        $this->refreshDatabase();
        dump([
            'driver' => config('database.connections.payments_db.driver'),
            'has_payments' => Schema::connection('payments_db')->hasTable('payments'),
            'count' => \App\Models\Payment::count(),
        ]);
        $this->assertTrue(true);
    }
}
