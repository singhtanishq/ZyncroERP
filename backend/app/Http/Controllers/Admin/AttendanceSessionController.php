<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AttendanceSessionController extends Controller
{
    public function start(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);

        /* ---------------- VALIDATIONS ---------------- */

        $validBatch = DB::table('batches')
            ->where('id', $data['batch_id'])
            ->where('course_id', $data['course_id'])
            ->where('status', 'active')
            ->exists();

        $validCourse = DB::table('courses')
            ->where('id', $data['course_id'])
            ->where('status', 'active')
            ->exists();

        if (!$validBatch || !$validCourse) {
            return response()->json([
                'message' => 'Invalid or inactive course/batch'
            ], 422);
        }

        /* ---------------- CLEAN OLD SESSIONS ---------------- */

        $now = now();

        /* ---------------- CREATE SESSION ---------------- */

        /*
         | Serialized on the course/batch pair: the existence check + insert
         | run inside one transaction against a locked query so two
         | concurrent starts cannot both pass.
         */
        return DB::transaction(function () use ($data, $now) {

            DB::table('attendance_sessions')
                ->where('ends_at', '<=', $now)
                ->where('status', 'active')
                ->update([
                    'status' => 'expired',
                    'updated_at' => $now
                ]);

            $exists = DB::table('attendance_sessions')
                ->where('course_id', $data['course_id'])
                ->where('batch_id', $data['batch_id'])
                ->where('status', 'active')
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Attendance already running for this course and batch'
                ], 409);
            }

            $endsAt = $now->copy()->addMinutes(10);
            $qrToken = (string) Str::uuid();

            $sessionId = DB::table('attendance_sessions')->insertGetId([
                'course_id'    => $data['course_id'],
                'batch_id'     => $data['batch_id'],
                'session_date' => $now->toDateString(),
                'starts_at'    => $now,
                'ends_at'      => $endsAt,
                'qr_token'     => $qrToken,
                'created_by'   => auth()->id(),
                'status'       => 'active',
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);

            return response()->json([
                'session_id' => $sessionId,
                'qr_token'   => $qrToken,
                'expires_at' => $endsAt->toIso8601String(),
            ]);
        });
    }

    public function end(Request $request)
    {
        $data = $request->validate([
            'session_id' => 'required|exists:attendance_sessions,id',
        ]);
    
        $session = DB::table('attendance_sessions')
            ->where('id', $data['session_id'])
            ->first();
    
        if (!$session) {
            return response()->json([
                'message' => 'Attendance session not found'
            ], 404);
        }
    
        $now = now();
    
        $updated = DB::table('attendance_sessions')
            ->where('id', $session->id)
            ->where('status', 'active')
            ->update([
                'status' => 'expired',
                'ends_at' => $now,
                'updated_at' => $now,
            ]);
    
        if (!$updated) {
            return response()->json([
                'message' => 'Session already ended'
            ]);
        }
    
        return response()->json([
            'message' => 'Session ended successfully',
            'session' => $session,
        ]);
    }
    
    public function report(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);
    
        /* ---------------- GET SESSIONS ---------------- */
        $sessions = DB::table('attendance_sessions')
            ->where('course_id', $data['course_id'])
            ->where('batch_id', $data['batch_id'])
            ->orderBy('starts_at')
            ->get(['id', 'starts_at']);
    
        /* ---------------- GET STUDENTS ---------------- */
        $students = DB::table('student_enrollments')
            ->join('students', 'students.id', '=', 'student_enrollments.student_id')
            ->join('users', 'users.id', '=', 'students.user_id')
            ->where('student_enrollments.course_id', $data['course_id'])
            ->where('student_enrollments.batch_id', $data['batch_id'])
            ->where('student_enrollments.status', 'active')
            ->get([
                'students.id',
                'students.sid',
                'users.name'
            ]);
    
        /* ---------------- GET ATTENDANCE ---------------- */
        $sessionIds = $sessions->pluck('id')->toArray();

        $attendance = collect();
        
        if (!empty($sessionIds)) {
            $attendance = DB::table('attendances')
                ->whereIn('attendance_session_id', $sessionIds)
                ->get();
        }
    
        /* ---------------- MAP DATA ---------------- */
        $attendanceMap = [];
    
        foreach ($attendance as $a) {
            $attendanceMap[$a->student_id][$a->attendance_session_id] = 'present';
        }
    
        $studentData = $students->map(function ($s) use ($sessions, $attendanceMap) {
            $record = [];
    
            foreach ($sessions as $session) {
                $record[$session->id] =
                    $attendanceMap[$s->id][$session->id] ?? 'absent';
            }
    
            return [
                'id' => $s->id,
                'sid' => $s->sid,
                'name' => $s->name,
                'attendance' => $record,
            ];
        });
    
        return response()->json([
            'sessions' => $sessions,
            'students' => $studentData,
        ]);
    }
}