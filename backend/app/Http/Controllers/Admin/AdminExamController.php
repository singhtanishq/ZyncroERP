<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Enums\ExamStatus;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminExamController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        $exams = Exam::with(['course', 'batch'])
            ->orderBy('start_time', 'desc')
            ->get();

        foreach ($exams as $exam) {

            // Preserve cancelled exams
            if ($exam->status === ExamStatus::CANCELLED) {
                continue;
            }

            // Resolve status dynamically based on time
            if ($now->between($exam->start_time, $exam->end_time)) {
                $exam->status = ExamStatus::LIVE;
            } elseif ($now->greaterThan($exam->end_time)) {
                $exam->status = ExamStatus::PAST;
            } else {
                $exam->status = ExamStatus::UPCOMING;
            }
        }

        return $exams;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'required|exists:batches,id',
            'exam_category' => 'required|string',

            'start_time' => 'required|date',
            'duration_minutes' => 'required|integer|min:1',
            'end_time' => 'required|date|after:start_time',

            'mode' => 'required|in:online,offline',

            'platform_name' => 'nullable|string',
            'platform_description' => 'nullable|string',
            'exam_link' => 'nullable|url',

            'center_name' => 'nullable|string',
            'offline_notes' => 'nullable|string',
        ]);

        $data['status'] = ExamStatus::UPCOMING;

        return Exam::create($data);
    }

    public function update(Request $request, Exam $exam)
    {
        /*
         | The DB status stays 'upcoming' for the exam's whole life — the live
         | / past states are derived. Editing is therefore guarded by time,
         | not by the stored status.
         */
        if ($exam->status === ExamStatus::CANCELLED || $exam->start_time->isPast()) {
            return response()->json(['message' => 'Exam cannot be updated'], 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'exam_category' => 'sometimes|required|string|max:100',
            'platform_name' => 'nullable|string|max:255',
            'platform_description' => 'nullable|string',
            'exam_link' => 'nullable|url',
            'center_name' => 'nullable|string|max:255',
            'offline_notes' => 'nullable|string',
        ]);

        $exam->update($data);

        return $exam->fresh();
    }

    public function postpone(Request $request, Exam $exam)
    {
        if ($exam->status === ExamStatus::CANCELLED || $exam->start_time->isPast()) {
            return response()->json(['message' => 'Exam cannot be postponed'], 403);
        }

        $data = $request->validate([
            'start_time' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:1',
            'end_time' => 'required|date|after:start_time',
        ]);

        $exam->update($data);

        return $exam;
    }

    public function cancel(Request $request, Exam $exam)
    {
        if ($exam->status === ExamStatus::CANCELLED) {
            return response()->json(['message' => 'Exam is already cancelled'], 422);
        }

        if ($exam->end_time->isPast()) {
            return response()->json(['message' => 'Past exam cannot be cancelled'], 403);
        }

        $exam->update(['status' => ExamStatus::CANCELLED]);

        return response()->json(['message' => 'Exam cancelled']);
    }
}
