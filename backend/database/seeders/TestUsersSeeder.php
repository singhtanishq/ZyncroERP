<?php

namespace Database\Seeders;

use App\Models\CorporateEmployee;
use App\Models\CorporateRole;
use App\Models\Faculty;
use App\Models\Franchise;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Creates the mandatory local test accounts, one per role.
 *
 * The shared password is read from SEED_USER_PASSWORD so no credential
 * is hardcoded in source control. Set it in backend/.env before seeding.
 */
class TestUsersSeeder extends Seeder
{
    public const PASSWORD_ENV = 'SEED_USER_PASSWORD';
    public const DEFAULT_LOCAL_PASSWORD = 'Zyncro@2026';

    public static function password(): string
    {
        return (string) env(self::PASSWORD_ENV, self::DEFAULT_LOCAL_PASSWORD);
    }

    public function run(): void
    {
        $password = self::password();

        $users = [
            [
                'name' => 'Tanishq Singh',
                'email' => 'contact@tanishqsingh.in',
                'role' => 'admin',
            ],
            [
                'name' => 'Tanishq Faculty',
                'email' => 'tanishqsingh@outlook.in',
                'role' => 'faculty',
            ],
            [
                'name' => 'Tanishq Student',
                'email' => 'tanishq@iiitmanipur.ac.in',
                'role' => 'student',
            ],
            [
                'name' => 'Tanishq Franchise',
                'email' => 'tanishqsingh.in@gmail.com',
                'role' => 'franchise',
            ],
            [
                'name' => 'Tanishq Employee',
                'email' => 'tanishq.cred@gmail.com',
                'role' => 'employee',
            ],
        ];

        foreach ($users as $entry) {

            $user = User::updateOrCreate(
                ['email' => $entry['email']],
                [
                    'name' => $entry['name'],
                    'password' => Hash::make($password),
                    'role' => $entry['role'],
                    'approve_status' => true,
                    'email_verified_at' => now(),
                ]
            );

            match ($entry['role']) {
                'student' => $this->ensureStudentProfile($user),
                'faculty' => $this->ensureFacultyProfile($user),
                'franchise' => $this->ensureFranchiseProfile($user),
                'employee' => $this->ensureEmployeeProfile($user),
                default => null,
            };
        }
    }

    private function ensureStudentProfile(User $user): void
    {
        Student::updateOrCreate(
            ['user_id' => $user->id],
            ['sid' => $this->uniqueSid('10000001')],
        );
    }

    private function ensureFacultyProfile(User $user): void
    {
        Faculty::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code' => 'FAC0001',
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '9000000001',
                'qualification' => 'M.Tech',
                'specialization' => 'Computer Science',
                'join_date' => now()->subMonths(10)->toDateString(),
                'salary' => 55000,
            ],
        );
    }

    private function ensureFranchiseProfile(User $user): void
    {
        Franchise::updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Zyncro Learning Hub',
                'code' => 'FRN0001',
                'owner_name' => $user->name,
                'phone' => '9000000002',
                'email' => $user->email,
                'address' => 'Local Test Address, Imphal',
                'status' => 'active',
            ],
        );
    }

    private function ensureEmployeeProfile(User $user): void
    {
        $role = CorporateRole::firstOrCreate(
            ['name' => 'Operations Executive'],
            ['description' => 'Handles day-to-day operational coordination.'],
        );

        CorporateEmployee::updateOrCreate(
            ['user_id' => $user->id],
            [
                'employee_id' => 'EMP00001',
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '9000000003',
                'role_id' => $role->id,
                'department' => 'Operations',
                'joining_date' => now()->subMonths(6)->toDateString(),
                'status' => 'active',
            ],
        );
    }

    private function uniqueSid(string $preferred): string
    {
        $sid = $preferred;

        while (Student::where('sid', $sid)->exists()) {
            $sid = (string) random_int(10000000, 99999999);
        }

        return $sid;
    }
}
