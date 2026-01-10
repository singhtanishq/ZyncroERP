<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentExamResultController extends Controller
{
    public function enrollments(Request $request)
    {
        $student = Student::where('user_id', $request->user()->id)
            ->with([
                'enrollments.course',
                'enrollments.batch'
            ])
            ->firstOrFail();

        return $student->enrollments
            ->whereIn('status', [
                'active',
                'completed',
            ])
            ->values()
            ->map(function ($enrollment) {
                return [
                    'course_id' => $enrollment->course_id,
                    'course_name' => $enrollment->course?->name,

                    'batch_id' => $enrollment->batch_id,
                    'batch_name' => $enrollment->batch?->name,
                ];
            });
    }

    public function results(Request $request, $courseId, $batchId)
    {
        $student = Student::where('user_id', $request->user()->id)
            ->firstOrFail();

        // ADDED: eager loading 'course' and 'batch'
        $exams = Exam::with(['course', 'batch'])
            ->where('course_id', $courseId)
            ->where('batch_id', $batchId)
            ->orderBy('start_time')
            ->get();

        $results = ExamResult::where('student_id', $student->id)
            ->whereIn('exam_id', $exams->pluck('id'))
            ->get()
            ->keyBy('exam_id');

        return $exams->map(function ($exam) use ($results) {

            $score = $results[$exam->id]->score ?? null;

            return [
                'exam_id' => $exam->id,
                'exam_name' => $exam->name,
                'exam_category' => $exam->exam_category,
                
                // ADDED: passing course and batch to the frontend
                'course' => $exam->course,
                'batch' => $exam->batch,

                'start_time' => $exam->start_time,
                'end_time' => $exam->end_time,

                'score' => $score,

                'status' => is_numeric($score)
                    ? ($score >= 40 ? 'passed' : 'failed')
                    : 'pending',
            ];
        })->values();
    }
}