<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;

class StudentListController extends Controller
{
    public function index()
    {
        $students = Student::with(['course', 'batch'])
            ->join('users', 'users.id', '=', 'students.user_id')
            ->select(
                'students.id as student_id',
                'students.sid',
                'students.course_id',
                'students.batch_id',
                'students.admission_date', 
                'users.id as user_id',
                'users.name',
                'users.email',
                'users.mobile'
            )
            ->addSelect('users.password IS NOT NULL as has_login')
            ->orderBy('students.created_at', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'student_id'     => $s->student_id,
                    'user_id'        => $s->user_id,
                    'sid'            => $s->sid,
                    'name'           => $s->name,
                    'email'          => $s->email,
                    'mobile'         => $s->mobile,
                    'admission_date' => $s->admission_date, 
                    'course_name'    => optional($s->course)->name,
                    'batch_name'     => optional($s->batch)->name,
                    'has_login'      => (bool) $s->has_login,
                ];
            });

        return response()->json($students);
    }
}