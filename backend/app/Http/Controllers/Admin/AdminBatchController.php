<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Student;

class AdminBatchController extends Controller
{
    public function listByCourse($courseId)
    {
        if (!Course::where('id', $courseId)->exists()) {
            return response()->json([], 200);
        }
    
        return Batch::where('course_id', $courseId)
            ->orderBy('start_date')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'course_id'  => 'required|exists:courses,id',
            'name'       => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        return DB::transaction(function () use ($data) {
            return Batch::create($data);
        });
    }

    public function update(Request $request, $id)
    {
        $batch = Batch::findOrFail($id);

        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $batch->update($data);

        return $batch;
    }

    public function toggle($id)
    {
        $batch = Batch::findOrFail($id);

        $batch->status = $batch->status === 'active' ? 'inactive' : 'active';
        $batch->save();

        return response()->json(['status' => $batch->status]);
    }

    public function destroy($id)
    {
        $batch = Batch::findOrFail($id);

        $hasStudents = Student::where('batch_id', $batch->id)->exists();

        if ($hasStudents) {
            return response()->json([
                'message' => 'Students are associated with this batch. Deletion not allowed.'
            ], 409);
        }

        $batch->delete();

        return response()->json([
            'message' => 'Batch deleted successfully'
        ]);
    }
}
