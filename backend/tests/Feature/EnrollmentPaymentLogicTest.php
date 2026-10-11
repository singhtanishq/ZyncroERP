<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Payment;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\StudentEnrollment;
use App\Models\StudentFee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression coverage for the enrollment/payment/certificate logic that
 * was repaired during the audit.
 */
class EnrollmentPaymentLogicTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Student $student;

    private Course $course;

    private Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'approve_status' => true]);

        $studentUser = User::factory()->create(['role' => 'student', 'approve_status' => true]);
        $this->student = Student::create(['user_id' => $studentUser->id, 'sid' => '88000001']);

        $this->course = Course::create([
            'name' => 'Test Course', 'code' => 'TC1', 'status' => 'active', 'amount' => 1000,
        ]);
        $this->batch = Batch::create([
            'course_id' => $this->course->id, 'name' => 'Batch A', 'status' => 'active',
            'start_date' => now()->toDateString(), 'end_date' => now()->addMonths(2)->toDateString(),
        ]);
    }

    private function createEnrollment(): StudentEnrollment
    {
        return StudentEnrollment::create([
            'student_id' => $this->student->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'joined_at' => now()->toDateString(),
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    private function verifyProof(StudentEnrollment $enrollment): void
    {
        StudentDocument::create([
            'student_id' => $this->student->id,
            'enrollment_id' => $enrollment->id,
            'document_type' => 'payment_proof',
            'file_path' => 'student-documents/proof.pdf',
            'verification_status' => 'verified',
        ]);
    }

    public function test_approve_requires_pending_status(): void
    {
        $enrollment = $this->createEnrollment();
        $enrollment->update(['status' => 'completed']);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/approve")
            ->assertStatus(422);
    }

    public function test_reject_requires_remarks(): void
    {
        $enrollment = $this->createEnrollment();

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", ['remarks' => ''])
            ->assertStatus(422);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", ['remarks' => 'Incomplete documents'])
            ->assertStatus(200);

        $this->assertEquals('cancelled', $enrollment->fresh()->status);
    }

    public function test_completed_enrollment_cannot_be_rejected(): void
    {
        $enrollment = $this->createEnrollment();
        $enrollment->update(['status' => 'completed']);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/reject", ['remarks' => 'Too late'])
            ->assertStatus(422);
    }

    public function test_mark_paid_requires_verified_proof(): void
    {
        $enrollment = $this->createEnrollment();
        StudentFee::create([
            'student_id' => $this->student->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'total_fees' => 1000,
            'paid_fees' => 0,
            'status' => 'pending',
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/mark-paid", ['amount' => 500])
            ->assertStatus(422);
    }

    public function test_mark_paid_records_ledger_entry_and_rejects_overpayment(): void
    {
        $enrollment = $this->createEnrollment();
        $this->verifyProof($enrollment);
        StudentFee::create([
            'student_id' => $this->student->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'total_fees' => 1000,
            'paid_fees' => 0,
            'status' => 'pending',
        ]);

        // Overpayment is refused instead of silently clamped.
        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/mark-paid", ['amount' => 2000])
            ->assertStatus(422);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/enrollments/{$enrollment->id}/mark-paid", ['amount' => 1000])
            ->assertStatus(200);

        // The ledger lives on the payments_db connection.
        $this->assertSame(1, Payment::count());
        $ledgerEntry = Payment::first();
        $this->assertSame('success', $ledgerEntry->status);
        $this->assertSame('offline', $ledgerEntry->payment_mode);
        $this->assertEquals('paid', $enrollment->fresh()->payment_status);
    }

    public function test_fee_update_scopes_to_course_and_rejects_overpay(): void
    {
        $feeA = StudentFee::create([
            'student_id' => $this->student->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'total_fees' => 1000,
            'paid_fees' => 0,
            'status' => 'pending',
        ]);

        $courseB = Course::create(['name' => 'Course B', 'code' => 'CB', 'status' => 'active', 'amount' => 500]);
        $feeB = StudentFee::create([
            'student_id' => $this->student->id,
            'course_id' => $courseB->id,
            'batch_id' => null,
            'total_fees' => 500,
            'paid_fees' => 0,
            'status' => 'pending',
        ]);

        // Update course B's fee WITHOUT a course_id: must touch the first row
        // but never rewrite course_id/batch_id.
        $this->actingAs($this->admin)
            ->postJson("/api/student-fees/{$this->student->id}", ['paid_fees' => 300])
            ->assertStatus(200);

        // Scoped update on course B.
        $this->actingAs($this->admin)
            ->postJson("/api/student-fees/{$this->student->id}", ['paid_fees' => 500, 'course_id' => $courseB->id])
            ->assertStatus(200);

        $this->assertEquals(300, $feeA->fresh()->paid_fees);
        $this->assertEquals($this->course->id, $feeA->fresh()->course_id);
        $this->assertEquals(500, $feeB->fresh()->paid_fees);
        $this->assertEquals('paid', $feeB->fresh()->status);

        // Overpay is refused.
        $this->actingAs($this->admin)
            ->postJson("/api/student-fees/{$this->student->id}", ['paid_fees' => 9999, 'course_id' => $courseB->id])
            ->assertStatus(422);
    }

    public function test_certificate_issue_blocked_when_any_exam_failed(): void
    {
        $examA = Exam::create([
            'name' => 'Exam A', 'course_id' => $this->course->id, 'batch_id' => $this->batch->id,
            'exam_category' => 'final', 'start_time' => now()->subDays(2), 'end_time' => now()->subDays(2)->addHours(2),
            'duration_minutes' => 120, 'mode' => 'offline', 'status' => 'past',
        ]);
        $examB = Exam::create([
            'name' => 'Exam B', 'course_id' => $this->course->id, 'batch_id' => $this->batch->id,
            'exam_category' => 'final', 'start_time' => now()->subDay(), 'end_time' => now()->subDay()->addHours(2),
            'duration_minutes' => 120, 'mode' => 'offline', 'status' => 'past',
        ]);

        $enrollment = $this->createEnrollment();
        $enrollment->update(['status' => 'active', 'payment_status' => 'paid']);

        \App\Models\Certificate::create([
            'certifiable_id' => $this->student->id,
            'certifiable_type' => Student::class,
            'type' => 'course',
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'exam_id' => $examA->id,
            'status' => 'passed',
            'score' => 80,
        ]);
        $failedCert = \App\Models\Certificate::create([
            'certifiable_id' => $this->student->id,
            'certifiable_type' => Student::class,
            'type' => 'course',
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'exam_id' => $examB->id,
            'status' => 'failed',
            'score' => 20,
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/certificates/{$failedCert->id}/issue")
            ->assertStatus(422);
    }

    public function test_admit_card_requires_active_enrollment(): void
    {
        $exam = Exam::create([
            'name' => 'Upcoming Exam', 'course_id' => $this->course->id, 'batch_id' => $this->batch->id,
            'exam_category' => 'final', 'start_time' => now()->addDays(3), 'end_time' => now()->addDays(3)->addHours(2),
            'duration_minutes' => 120, 'mode' => 'offline', 'status' => 'upcoming',
        ]);

        // No enrollment exists for this student.
        $this->actingAs($this->admin)
            ->postJson("/api/admin/admit-cards/{$exam->id}/{$this->student->id}")
            ->assertStatus(422);
    }

    public function test_exam_results_rejected_before_exam_end(): void
    {
        $exam = Exam::create([
            'name' => 'Future Exam', 'course_id' => $this->course->id, 'batch_id' => $this->batch->id,
            'exam_category' => 'final', 'start_time' => now()->addDays(3), 'end_time' => now()->addDays(3)->addHours(2),
            'duration_minutes' => 120, 'mode' => 'offline', 'status' => 'upcoming',
        ]);

        $this->createEnrollment()->update(['status' => 'active']);

        $this->actingAs($this->admin)
            ->postJson('/api/admin/exam-results/save', [
                'student_id' => $this->student->id,
                'scores' => [['exam_id' => $exam->id, 'score' => 85]],
            ])
            ->assertStatus(422);
    }
}
