<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Student;
use App\Models\Certificate;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    /** Pass mark for every exam (shared by admin and student views). */
    public const PASS_MARK = 40;

    public function save(Request $request)
    {
        $data = $request->validate([
            'student_id'        => 'required|exists:students,id',
            'scores'            => 'required|array|min:1',
            'scores.*.exam_id'  => 'required|exists:exams,id',
            'scores.*.score'    => 'nullable|numeric|min:0|max:100',
        ]);

        $student = Student::findOrFail($data['student_id']);

        DB::transaction(function () use ($data, $student) {

            foreach ($data['scores'] as $row) {

                $exam = Exam::findOrFail($row['exam_id']);

                // Results can only be entered once the exam has actually run.
                if ($exam->status === ExamStatus::CANCELLED || $exam->end_time->isFuture()) {
                    abort(422, "Results for \"{$exam->name}\" can only be saved after the exam has ended.");
                }

                /*
                 | Scores may only be recorded for students actively enrolled in
                 | the exam's exact course + batch — this also blocks faculty
                 | requests that mix in foreign exam ids (see Faculty controller).
                 */
                $enrolled = StudentEnrollment::where('student_id', $student->id)
                    ->where('course_id', $exam->course_id)
                    ->where('batch_id', $exam->batch_id)
                    ->where('status', 'active')
                    ->exists();

                if (! $enrolled) {
                    abort(422, "Student is not actively enrolled in \"{$exam->name}\"'s course and batch.");
                }

                $existingCertificate = Certificate::where('certifiable_id', $student->id)
                    ->where('certifiable_type', Student::class)
                    ->where('exam_id', $row['exam_id'])
                    ->first();

                if ($existingCertificate && $existingCertificate->issued_at) {
                    abort(409, 'Results are locked. Certificate already issued.');
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

                // Absent (no score): keep the result row but never mint a
                // failed certificate for it.
                if (! is_numeric($row['score'])) {
                    if ($existingCertificate && ! $existingCertificate->issued_at) {
                        $existingCertificate->delete();
                    }
                    continue;
                }

                $status = $row['score'] >= self::PASS_MARK ? 'passed' : 'failed';

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
        });

        return response()->json([
            'message' => 'Scores saved and certificate eligibility updated',
        ]);
    }
}
