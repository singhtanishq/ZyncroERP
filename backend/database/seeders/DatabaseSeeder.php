<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the local database:
     *  1. the five mandatory role test accounts (password from SEED_USER_PASSWORD)
     *  2. deterministic demo data for every module
     */
    public function run(): void
    {
        $this->call([
            TestUsersSeeder::class,
            DemoDataSeeder::class,
        ]);
    }
}
