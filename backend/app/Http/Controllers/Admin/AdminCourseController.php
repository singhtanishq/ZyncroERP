<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Student;

class AdminCourseController extends Controller
{
    public function index()
    {
        return Course::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:courses,code',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $data['amount'] = $data['amount'] ?? 0;

        return DB::transaction(function () use ($data) {
            return Course::create($data);
        });
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:courses,code,' . $course->id,
            'amount' => 'nullable|numeric|min:0',
        ]);

        $data['amount'] = $data['amount'] ?? 0;

        $oldAmount = (float) $course->amount;

        $course->update($data);

        /*
         | Fee totals are snapshotted at enrollment time. Propagate a price
         | change to every fee row that is not fully paid yet.
         */
        if ((float) $course->amount !== $oldAmount) {
            DB::table('student_fees')
                ->where('course_id', $course->id)
                ->where('status', '!=', 'paid')
                ->update([
                    'total_fees' => $course->amount,
                    'updated_at' => now(),
                ]);
        }

        return $course;
    }

    public function toggle($id)
    {
        $course = Course::findOrFail($id);

        $course->status = $course->status === 'active' ? 'inactive' : 'active';
        $course->save();

        return response()->json(['status' => $course->status]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        /*
         | Beyond direct student links, deleting a course cascades exams,
         | results, admit cards, assignments, submissions, enrollments and
         | fee rows — all of that academic/financial history must block it.
         */
        $hasStudents = Student::where('course_id', $course->id)->exists();

        if ($hasStudents) {
            return response()->json([
                'message' => 'Students are associated with this course. Deletion not allowed.'
            ], 409);
        }

        $hasExams = \App\Models\Exam::where('course_id', $course->id)->exists();
        if ($hasExams) {
            return response()->json([
                'message' => 'Exams exist for this course. Deletion not allowed.'
            ], 409);
        }

        $hasAssignments = \App\Models\Assignment::where('course_id', $course->id)->exists();
        if ($hasAssignments) {
            return response()->json([
                'message' => 'Assignments exist for this course. Deletion not allowed.'
            ], 409);
        }

        $hasEnrollments = \App\Models\StudentEnrollment::where('course_id', $course->id)->exists();
        if ($hasEnrollments) {
            return response()->json([
                'message' => 'Enrollment records exist for this course. Deletion not allowed.'
            ], 409);
        }

        $hasFees = \App\Models\StudentFee::where('course_id', $course->id)->exists();
        if ($hasFees) {
            return response()->json([
                'message' => 'Fee records exist for this course. Deletion not allowed.'
            ], 409);
        }

        $course->batches()->delete();

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully'
        ]);
    }
}
