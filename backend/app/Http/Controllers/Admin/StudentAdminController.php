<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\Batch;
use App\Models\StudentEnrollment;
use App\Models\StudentFee;
use App\Models\StudentIdCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\EmailService;

class StudentAdminController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'course_id' => 'nullable|exists:courses,id',
            'batch_id'  => 'nullable|exists:batches,id',
        ]);

        // Logical validation
        if (!empty($data['batch_id'])) {
            $batch = Batch::where('id', $data['batch_id'])
                ->where('status', 'active')
                ->firstOrFail();

            if (
                $data['course_id'] &&
                $batch->course_id !== (int) $data['course_id']
            ) {
                abort(422, 'Selected batch does not belong to selected course');
            }
        }

        if ($data['course_id']) {
            Course::where('id', $data['course_id'])
                ->where('status', 'active')
                ->firstOrFail();
        }

        $plainPassword = Str::random(32);

        $result = DB::transaction(function () use ($data, $plainPassword) {

            $user = User::create([
                'name'           => $data['name'],
                'email'          => $data['email'],
                'role'           => 'student',
                'approve_status' => true,
                'password'       => Hash::make($plainPassword),
            ]);

            $student = Student::create([
                'user_id'   => $user->id,
                'sid'       => $this->generateSid(),
                'course_id' => $data['course_id'] ?? null,
                'batch_id'  => $data['batch_id'] ?? null,
            ]);

            if (!empty($data['course_id'])) {

                StudentEnrollment::create([
                    'student_id'      => $student->id,
                    'course_id'       => $data['course_id'],
                    'batch_id'        => $data['batch_id'] ?? null,
                    'joined_at'       => now()->toDateString(),
                    'completion_date' => null,
                    'status'          => 'pending',
                    'payment_status'  => 'pending',
                ]);

                $course = Course::find($data['course_id']);

                StudentFee::create([
                    'student_id' => $student->id,
                    'course_id'  => $data['course_id'],
                    'batch_id'   => $data['batch_id'] ?? null,
                    'total_fees' => $course->amount ?? 0,
                    'paid_fees'  => 0,
                    'status'     => 'pending',
                ]);
            }

            return $student;
        });

        app(EmailService::class)->studentCredentials(
            $data['email'],
            $data['name'],
            $plainPassword
        );

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $result,
        ], 201);
    }

    private function generateSid(): string
    {
        do {
            $sid = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        } while (Student::where('sid', $sid)->exists());

        return $sid;
    }
}
