<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\CorporateAnnouncement;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\FacultyAssignment;
use App\Models\Franchise;
use App\Models\FranchiseCommission;
use App\Models\FranchisePayment;
use App\Models\Payment;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentFee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Deterministic demo data so every dashboard, table, search, filter and
 * report has meaningful content on a fresh local install.
 *
 * Students, faculty and payments are internally consistent: enrollments
 * carry fee records, franchise students are linked to the franchise, and
 * payment ledger rows match enrolled students.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $franchise = Franchise::where('code', 'FRN0001')->firstOrFail();

        /* ================= Courses & batches ================= */

        $courses = collect([
            ['name' => 'Full Stack Web Development', 'code' => 'FSW', 'amount' => 24000],
            ['name' => 'Data Analytics with Python', 'code' => 'DAP', 'amount' => 18000],
            ['name' => 'Digital Marketing Pro', 'code' => 'DMP', 'amount' => 12000],
            ['name' => 'Spoken English Foundations', 'code' => 'SEF', 'amount' => 6000],
        ])->map(function ($row) {
            return Course::firstOrCreate(
                ['code' => $row['code']],
                $row + ['status' => 'active']
            );
        });

        $batches = collect();

        foreach ($courses as $index => $course) {
            $batches[$course->code] = Batch::firstOrCreate(
                ['course_id' => $course->id, 'name' => 'Morning Batch A'],
                [
                    'start_date' => now()->subMonths(3 - $index)->toDateString(),
                    'end_date' => now()->addMonths(3 + $index)->toDateString(),
                    'status' => 'active',
                ],
            );
        }

        /* ================= Faculty ================= */

        $institutionFaculty = User::where('email', 'tanishqsingh@outlook.in')->firstOrFail();
        $mainFaculty = Faculty::where('user_id', $institutionFaculty->id)->firstOrFail();

        $franchiseFacultyUser = User::firstOrCreate(
            ['email' => 'faculty.demo@example.com'],
            [
                'name' => 'Demo Franchise Faculty',
                'email' => 'faculty.demo@example.com',
                'password' => Hash::make(TestUsersSeeder::password()),
                'role' => 'faculty',
                'approve_status' => true,
                'email_verified_at' => now(),
            ],
        );

        $franchiseFaculty = Faculty::firstOrCreate(
            ['user_id' => $franchiseFacultyUser->id],
            [
                'franchise_id' => $franchise->id,
                'code' => 'FAC0002',
                'name' => $franchiseFacultyUser->name,
                'email' => $franchiseFacultyUser->email,
                'phone' => '9000000011',
                'qualification' => 'M.Sc',
                'specialization' => 'Mathematics',
                'join_date' => now()->subMonths(4)->toDateString(),
                'salary' => 40000,
            ],
        );

        // Main faculty teaches the first two batches, franchise faculty the rest.
        foreach ($courses->take(2) as $course) {
            FacultyAssignment::firstOrCreate([
                'faculty_id' => $mainFaculty->id,
                'course_id' => $course->id,
                'batch_id' => $batches[$course->code]->id,
            ]);
        }

        foreach ($courses->skip(2) as $course) {
            FacultyAssignment::firstOrCreate([
                'faculty_id' => $franchiseFaculty->id,
                'course_id' => $course->id,
                'batch_id' => $batches[$course->code]->id,
            ]);
        }

        /* ================= Students & enrollments ================= */

        $demoStudents = [
            ['name' => 'Aarav Sharma', 'email' => 'aarav.demo@example.com', 'course' => 'FSW', 'status' => 'active', 'payment' => 'paid', 'paid_ratio' => 1.0, 'via_franchise' => true],
            ['name' => 'Diya Patel', 'email' => 'diya.demo@example.com', 'course' => 'FSW', 'status' => 'active', 'payment' => 'partial', 'paid_ratio' => 0.5, 'via_franchise' => true],
            ['name' => 'Rohan Mehta', 'email' => 'rohan.demo@example.com', 'course' => 'DAP', 'status' => 'active', 'payment' => 'paid', 'paid_ratio' => 1.0, 'via_franchise' => false],
            ['name' => 'Ishaan Verma', 'email' => 'ishaan.demo@example.com', 'course' => 'DAP', 'status' => 'pending', 'payment' => 'pending', 'paid_ratio' => 0.0, 'via_franchise' => true],
            ['name' => 'Sara Khan', 'email' => 'sara.demo@example.com', 'course' => 'DMP', 'status' => 'active', 'payment' => 'paid', 'paid_ratio' => 1.0, 'via_franchise' => false],
            ['name' => 'Kabir Nair', 'email' => 'kabir.demo@example.com', 'course' => 'DMP', 'status' => 'completed', 'payment' => 'paid', 'paid_ratio' => 1.0, 'via_franchise' => true],
            ['name' => 'Meera Joshi', 'email' => 'meera.demo@example.com', 'course' => 'SEF', 'status' => 'active', 'payment' => 'verification_pending', 'paid_ratio' => 1.0, 'via_franchise' => false],
            ['name' => 'Vivaan Rao', 'email' => 'vivaan.demo@example.com', 'course' => 'SEF', 'status' => 'cancelled', 'payment' => 'pending', 'paid_ratio' => 0.0, 'via_franchise' => false],
        ];

        $primaryStudentUser = User::where('email', 'tanishq@iiitmanipur.ac.in')->firstOrFail();
        $primaryStudent = Student::where('user_id', $primaryStudentUser->id)->firstOrFail();

        foreach ($demoStudents as $index => $row) {

            $course = $courses->firstWhere('code', $row['course']);
            $batch = $batches[$row['course']];

            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'password' => Hash::make(TestUsersSeeder::password()),
                    'role' => 'student',
                    'approve_status' => true,
                    'email_verified_at' => now(),
                ],
            );

            $student = Student::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'sid' => (string) (20000001 + $index),
                    'course_id' => $course->id,
                    'batch_id' => $batch->id,
                    'franchise_id' => $row['via_franchise'] ? $franchise->id : null,
                    'admission_date' => now()->subMonths(2)->toDateString(),
                ],
            );

            $enrollment = StudentEnrollment::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'batch_id' => $batch->id,
                ],
                [
                    'joined_at' => now()->subMonths(2)->toDateString(),
                    'status' => $row['status'],
                    'payment_status' => $row['payment'],
                    'remarks' => null,
                ],
            );

            StudentFee::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                    'batch_id' => $batch->id,
                ],
                [
                    'total_fees' => $course->amount,
                    'paid_fees' => round($course->amount * $row['paid_ratio'], 2),
                    'status' => $row['payment'] === 'paid' ? 'paid' : ($row['paid_ratio'] > 0 ? 'partial' : 'pending'),
                ],
            );
        }

        // Give the primary test student an active, fully-paid enrollment too.
        $primaryCourse = $courses->firstWhere('code', 'FSW');
        $primaryBatch = $batches['FSW'];

        StudentEnrollment::firstOrCreate(
            [
                'student_id' => $primaryStudent->id,
                'course_id' => $primaryCourse->id,
                'batch_id' => $primaryBatch->id,
            ],
            [
                'joined_at' => now()->subMonths(2)->toDateString(),
                'status' => 'active',
                'payment_status' => 'paid',
            ],
        );

        StudentFee::firstOrCreate(
            [
                'student_id' => $primaryStudent->id,
                'course_id' => $primaryCourse->id,
                'batch_id' => $primaryBatch->id,
            ],
            [
                'total_fees' => $primaryCourse->amount,
                'paid_fees' => $primaryCourse->amount,
                'status' => 'paid',
            ],
        );

        /* ================= Franchise revenue & commission ================= */

        FranchiseCommission::firstOrCreate([], ['commission' => 20.00]);

        FranchisePayment::firstOrCreate(
            [
                'franchise_id' => $franchise->id,
                'total_amount' => 36000,
                'paid_amount' => 24000,
            ],
            ['status' => 'partial'],
        );

        FranchisePayment::firstOrCreate(
            [
                'franchise_id' => $franchise->id,
                'total_amount' => 12000,
                'paid_amount' => 12000,
            ],
            ['status' => 'paid'],
        );

        /* ================= Company announcements ================= */

        $adminUser = User::where('role', 'admin')->first();

        $announcements = [
            ['title' => 'Quarterly all-hands meeting', 'body' => 'The quarterly all-hands meeting is scheduled for the last Friday of this quarter at 4:00 PM in the main conference hall. Department leads will share updates and answer questions. Remote joining details will follow by email.', 'status' => 'active'],
            ['title' => 'Updated leave submission process', 'body' => 'Leave requests should now be submitted at least three working days in advance through your reporting manager. Emergency leave exceptions are handled case by case.', 'status' => 'active'],
            ['title' => 'New certificate verification portal', 'body' => 'Issued certificates can now be verified publicly using the certificate number printed on the document. Share your certificate number with employers for instant verification.', 'status' => 'active'],
            ['title' => 'Archived: old parking policy', 'body' => 'This announcement has been archived and is no longer applicable.', 'status' => 'inactive'],
        ];

        foreach ($announcements as $index => $row) {
            CorporateAnnouncement::firstOrCreate(
                ['title' => $row['title']],
                $row + ['created_by' => $adminUser?->id],
            );
        }

        /* ================= Payment ledger (payments database) ================= */
        $ledger = [
            ['name' => 'Aarav Sharma', 'email' => 'aarav.demo@example.com', 'amount' => 24000, 'status' => 'success', 'months_ago' => 3],
            ['name' => 'Rohan Mehta', 'email' => 'rohan.demo@example.com', 'amount' => 18000, 'status' => 'success', 'months_ago' => 2],
            ['name' => 'Sara Khan', 'email' => 'sara.demo@example.com', 'amount' => 12000, 'status' => 'success', 'months_ago' => 1],
            ['name' => 'Kabir Nair', 'email' => 'kabir.demo@example.com', 'amount' => 12000, 'status' => 'success', 'months_ago' => 1],
            ['name' => 'Meera Joshi', 'email' => 'meera.demo@example.com', 'amount' => 6000, 'status' => 'pending', 'months_ago' => 0],
        ];

        foreach ($ledger as $index => $row) {
            Payment::firstOrCreate(
                ['merchant_txn_no' => 'SEED-TXN-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT)],
                [
                    'amount' => $row['amount'],
                    'currency' => 'INR',
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'mobile' => '9000000' . str_pad((string) (20 + $index), 3, '0', STR_PAD_LEFT),
                    'country' => 'India',
                    'purpose' => 'Course fee payment',
                    'status' => $row['status'],
                    'payment_mode' => 'online',
                    'created_at' => now()->subMonths($row['months_ago'])->toDateTimeString(),
                    'updated_at' => now()->subMonths($row['months_ago'])->toDateTimeString(),
                ],
            );
        }
    }
}
