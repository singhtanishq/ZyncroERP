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

        $course->update($data);

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

        $hasStudents = Student::where('course_id', $course->id)->exists();

        if ($hasStudents) {
            return response()->json([
                'message' => 'Students are associated with this course. Deletion not allowed.'
            ], 409);
        }

        $course->batches()->delete();

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully'
        ]);
    }
}
