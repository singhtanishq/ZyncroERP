<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Payment;

class StudentPaymentHistoryController extends Controller
{
    public function index()
    {
        $student = Student::with('user')
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $email = $student->user->email;

        $payments = Payment::where('email', $email)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($payments);
    }
}