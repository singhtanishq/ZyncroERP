<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StudentDeleteController extends Controller
{
    public function destroy($studentId)
    {
        return DB::transaction(function () use ($studentId) {

            $student = Student::where('id', $studentId)->firstOrFail();

            $userId = $student->user_id;

            // delete student row
            $student->delete();

            // delete user row (optional but logical here)
            User::where('id', $userId)->delete();

            return response()->json([
                'message' => 'Student removed successfully'
            ]);
        });
    }
}
