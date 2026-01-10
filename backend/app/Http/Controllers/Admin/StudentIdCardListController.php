<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;

class StudentIdCardListController extends Controller
{
    public function index()
    {
        $students = Student::with(['user', 'idCard'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($s) {
                return [
                    'student_id' => $s->id,
                    'sid' => $s->sid,
                    'name' => $s->user->name,
                    'email' => $s->user->email,
                    'public_token' => $s->idCard?->public_token,
                    'has_card' => !is_null($s->idCard),
                    'active' => $s->idCard && !is_null($s->idCard->activated_at),
                ];
            });

        return response()->json($students);
    }
}
