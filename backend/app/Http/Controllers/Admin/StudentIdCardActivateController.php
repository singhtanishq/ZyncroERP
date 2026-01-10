<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentIdCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentIdCardActivateController extends Controller
{
    public function activate(Request $request, $studentId)
    {
        return DB::transaction(function () use ($studentId) {
    
            $student = Student::findOrFail($studentId);
    
            StudentIdCard::updateOrCreate(
                [
                    'student_id' => $student->id,
                ],
                [
                    'activated_at' => now(),
                    'qr_token'     => hash(
                        'sha256',
                        $student->sid . Str::random(16)
                    ),
                    'public_token' => Str::random(32),
                ]
            );
    
            return response()->json([
                'message' => 'Student ID Card generated successfully.',
            ]);
    
        });
    }
}
