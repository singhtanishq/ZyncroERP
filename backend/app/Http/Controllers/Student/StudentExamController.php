<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Student;
use App\Enums\ExamStatus;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StudentExamController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $student = Student::with([
            'enrollments' => function ($q) {
                $q->where('status', 'active');
            }
        ])
        ->where('user_id', $user->id)
        ->firstOrFail();

        $enrollments = $student->enrollments;

        if ($enrollments->isEmpty()) {
            return response()->json([]);
        }

        $exams = Exam::with(['course', 'batch'])
            ->get()
            ->filter(function ($exam) use ($enrollments) {

                return $enrollments->contains(function ($enrollment) use ($exam) {
                    return
                        $enrollment->course_id == $exam->course_id
                        &&
                        $enrollment->batch_id == $exam->batch_id;
                });
            })
            ->values();

        $now = Carbon::now();

        foreach ($exams as $exam) {

            if ($exam->status === ExamStatus::CANCELLED) {
                continue;
            }

            if ($now->between($exam->start_time, $exam->end_time)) {
                $exam->status = ExamStatus::LIVE;
            } elseif ($now->greaterThan($exam->end_time)) {
                $exam->status = ExamStatus::PAST;
            } else {
                $exam->status = ExamStatus::UPCOMING;
            }
        }

        return response()->json($exams);
    }

    public function show($id)
    {
        $user = Auth::user();

        $student = Student::with([
            'enrollments' => function ($q) {
                $q->where('status', 'active');
            }
        ])
        ->where('user_id', $user->id)
        ->firstOrFail();

        $exam = Exam::with(['course', 'batch'])
            ->findOrFail($id);

        $allowed = $student->enrollments->contains(function ($enrollment) use ($exam) {

            return
                $enrollment->course_id == $exam->course_id
                &&
                $enrollment->batch_id == $exam->batch_id;
        });

        if (!$allowed) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $now = Carbon::now();

        if ($exam->status !== ExamStatus::CANCELLED) {

            if ($now->between($exam->start_time, $exam->end_time)) {
                $exam->status = ExamStatus::LIVE;
            } elseif ($now->greaterThan($exam->end_time)) {
                $exam->status = ExamStatus::PAST;
            } else {
                $exam->status = ExamStatus::UPCOMING;
            }
        }

        return response()->json($exam);
    }
}