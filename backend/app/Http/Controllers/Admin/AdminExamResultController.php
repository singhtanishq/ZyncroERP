<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use App\Models\Certificate;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use App\Enums\ExamStatus;
use Carbon\Carbon;

class AdminExamResultController extends Controller
{
    /**
     * Result matrix for course + batch
     */
    public function index(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);

        $exams = Exam::where('course_id', $request->course_id)
            ->where('batch_id', $request->batch_id)
            ->where('end_time', '<', Carbon::now())
            ->orderBy('start_time')
            ->get();

        $studentIds = StudentEnrollment::where('course_id', $request->course_id)
            ->where('batch_id', $request->batch_id)
            ->where('status', 'active')
            ->pluck('student_id');
        
        $students = Student::with('user:id,name')
            ->whereIn('id', $studentIds)
            ->get();

       $results = ExamResult::whereIn('exam_id', $exams->pluck('id'))
        ->get()
        ->map(function ($result) {
            $certificate = Certificate::where('exam_id', $result->exam_id)
                ->where('certifiable_id', $result->student_id)
                ->where('certifiable_type', Student::class)
                ->first();
    
            $result->certificate = $certificate;
    
            return $result;
        })
        ->groupBy('student_id');
    
        return [
            'exams'    => $exams,
            'students' => $students,
            'results'  => $results,
        ];
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'student_id'        => 'required|exists:students,id',
            'scores'            => 'required|array',
            'scores.*.exam_id'  => 'required|exists:exams,id',
            'scores.*.score'    => 'nullable|numeric|min:0|max:100',
        ]);

        $student = Student::findOrFail($data['student_id']);

        foreach ($data['scores'] as $row) {

            $existingCertificate = Certificate::where('certifiable_id', $student->id)
                ->where('certifiable_type', Student::class)
                ->where('exam_id', $row['exam_id'])
                ->first();

            if ($existingCertificate && $existingCertificate->issued_at) {
                return response()->json([
                    'message' => 'Results are locked. Certificate already issued.'
                ], 409);
            }

            // Save exam result
            ExamResult::updateOrCreate(
                [
                    'exam_id'    => $row['exam_id'],
                    'student_id' => $student->id,
                ],
                [
                    'score' => $row['score'],
                ]
            );

            // Determine pass / fail
            $status = is_numeric($row['score']) && $row['score'] >= 40
                ? 'passed'
                : 'failed';

            $exam = Exam::find($row['exam_id']);

            Certificate::updateOrCreate(
            [
                'certifiable_id'   => $student->id,
                'certifiable_type' => Student::class,
                'exam_id'          => $row['exam_id'],
                'type'             => 'course',
            ],
            [
                'course_id'  => $exam->course_id,
                'batch_id'   => $exam->batch_id,
                'status'     => $status,
                'score'      => $row['score'],
            ]
            );
        }

        return response()->json([
            'message' => 'Scores saved and certificate eligibility updated',
        ]);
    }
}
