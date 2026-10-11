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
    
            $card = StudentIdCard::updateOrCreate(
                [
                    'student_id' => $student->id,
                ],
                [
                    'activated_at' => now(),
                    // The card carries no course linkage, so validity defaults
                    // to two years from activation and is refreshed on re-issue.
                    'expiry_date'  => now()->addYears(2)->toDateString(),
                    'qr_token'     => hash(
                        'sha256',
                        $student->sid . Str::random(16)
                    ),
                    'public_token' => Str::random(32),
                ]
            );

            return response()->json([
                'message' => 'Student ID Card generated successfully.',
                // Re-activation rotates both tokens: any previously printed
                // PDF link stops working, so callers should surface the new one.
                'card' => $card->only(['id', 'student_id', 'public_token', 'expiry_date', 'activated_at']),
            ]);
    
        });
    }
}
