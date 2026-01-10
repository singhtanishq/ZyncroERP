<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentUpdateController extends Controller
{
    public function update(Request $request, $studentId)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'dob'             => 'nullable|date',
            'country'         => 'nullable|string|max:100',
            'mobile'          => 'nullable|string|max:20',
            'admission_date'  => 'nullable|date',
        ]);

        return DB::transaction(function () use ($studentId, $data) {

            $student = Student::with('user')->lockForUpdate()->findOrFail($studentId);

            // update user
            $student->user->update([
                'name'    => $data['name'],
                'dob'     => $data['dob'],
                'country' => $data['country'],
                'mobile'  => $data['mobile'],
            ]);

            // update student
            $student->update([
                'admission_date' => $data['admission_date'],
            ]);

            return response()->json([
                'message' => 'Student updated successfully'
            ]);
        });
    }
}

