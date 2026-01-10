<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;

class StudentIdCardController extends Controller
{
    public function show()
    {
        $student = Student::with([
            'user',
            'course',
            'batch',
            'idCard'
        ])
        ->where('user_id', Auth::id())
        ->firstOrFail();

        return response()->json([
            'student_id' => $student->id,
            'sid'        => $student->sid,
            'name'       => $student->user->name,
            'email'      => $student->user->email,

            'dob' => optional($student->user->dob)
                ? \Carbon\Carbon::parse($student->user->dob)->format('d M Y')
                : null,
            
            'admission_date' => optional($student->admission_date)
                ? \Carbon\Carbon::parse($student->admission_date)->format('d M Y')
                : null,

            'id_card'    => $student->idCard,
            'public_token' => $student->idCard?->public_token,
        ]);
    }
}