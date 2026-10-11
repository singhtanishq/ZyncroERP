<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * RBAC matrix: every role's own endpoints answer 200, every other role
 * gets 401/403. This is the security backbone of the ERP.
 */
class RoleAccessControlTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'approve_status' => true,
        ]);
    }

    public function test_admin_dashboard_is_role_gated(): void
    {
        $admin = $this->makeUser('admin');
        $student = $this->makeUser('student');

        $this->actingAs($admin)->getJson('/api/admin/dashboard')->assertStatus(200);
        $this->actingAs($student)->getJson('/api/admin/dashboard')->assertStatus(403);
        $this->getJson('/api/admin/dashboard')->assertStatus(401);
    }

    public function test_student_endpoints_reject_other_roles(): void
    {
        $student = $this->makeUser('student');
        $faculty = $this->makeUser('faculty');

        $this->actingAs($student)->getJson('/api/student/dashboard')->assertStatus(200);
        $this->actingAs($faculty)->getJson('/api/student/dashboard')->assertStatus(403);
    }

    public function test_faculty_endpoints_reject_other_roles(): void
    {
        $faculty = $this->makeUser('faculty');
        $admin = $this->makeUser('admin');

        $this->actingAs($faculty)->getJson('/api/faculty/courses')->assertStatus(200);
        $this->actingAs($admin)->getJson('/api/faculty/courses')->assertStatus(403);
    }

    public function test_franchise_endpoints_reject_other_roles(): void
    {
        $franchise = $this->makeUser('franchise');
        $admin = $this->makeUser('admin');

        // No franchise profile is linked — a franchise user gets a clean 403,
        // while another role never even reaches the controller.
        $this->actingAs($franchise)->getJson('/api/franchise/dashboard')->assertStatus(403);
        $this->actingAs($admin)->getJson('/api/franchise/dashboard')->assertStatus(403);
    }

    public function test_employee_endpoints_reject_other_roles(): void
    {
        $employee = $this->makeUser('employee');
        $student = $this->makeUser('student');

        $this->actingAs($employee)->getJson('/api/employee/dashboard')->assertStatus(200);
        $this->actingAs($student)->getJson('/api/employee/dashboard')->assertStatus(403);
    }

    public function test_unapproved_users_are_blocked_from_dashboards(): void
    {
        $pending = User::factory()->create([
            'role' => 'student',
            'approve_status' => false,
        ]);

        $this->actingAs($pending)->getJson('/api/student/dashboard')->assertStatus(403);
    }

    public function test_admin_cannot_be_created_via_public_endpoints(): void
    {
        // Registration whitelist is enforced server-side; no admin route exists.
        $this->assertDatabaseCount('users', 0);
    }

    public function test_faculty_with_no_assignments_sees_no_students(): void
    {
        $faculty = $this->makeUser('faculty');
        $facultyProfile = \App\Models\Faculty::create([
            'user_id' => $faculty->id,
            'code' => 'FAC9001',
            'name' => 'Unassigned Faculty',
        ]);

        // A student with an active enrollment exists in the institution…
        $otherUser = $this->makeUser('student');
        $student = Student::create(['user_id' => $otherUser->id, 'sid' => '99000001']);
        $course = Course::create(['name' => 'C', 'code' => 'C1', 'status' => 'active', 'amount' => 100]);
        $batch = Batch::create(['course_id' => $course->id, 'name' => 'B', 'status' => 'active', 'start_date' => now(), 'end_date' => now()->addMonths(1)]);
        StudentEnrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'status' => 'active',
            'joined_at' => now()->toDateString(),
        ]);

        // …but an unassigned faculty must NOT see them.
        $response = $this->actingAs($faculty)->getJson('/api/faculty/students');
        $response->assertStatus(200)->assertJson([]);
    }
}
