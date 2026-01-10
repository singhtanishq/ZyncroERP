<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class StudentAttendanceController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIVE ATTENDANCE
    |--------------------------------------------------------------------------
    */

    public function live()
    {
        $student = DB::table('students')
            ->where('user_id', auth()->id())
            ->first();

        if (!$student) {
            return response()->json([
                'active' => false,
            ]);
        }

        $session = DB::table('attendance_sessions')
            ->join(
                'student_enrollments',
                function ($join) use ($student) {
                    $join->on(
                        'student_enrollments.course_id',
                        '=',
                        'attendance_sessions.course_id'
                    )
                    ->on(
                        'student_enrollments.batch_id',
                        '=',
                        'attendance_sessions.batch_id'
                    );
                }
            )
            ->join(
                'courses',
                'courses.id',
                '=',
                'attendance_sessions.course_id'
            )
            ->join(
                'batches',
                'batches.id',
                '=',
                'attendance_sessions.batch_id'
            )
            ->where(
                'student_enrollments.student_id',
                $student->id
            )
            ->where(
                'student_enrollments.status',
                'active'
            )
            ->where(
                'attendance_sessions.status',
                'active'
            )
            ->where(
                'attendance_sessions.ends_at',
                '>',
                now()
            )
            ->select(
                'attendance_sessions.id as session_id',
                'attendance_sessions.qr_token',
                'attendance_sessions.starts_at',
                'attendance_sessions.ends_at',
                'courses.name as course_name',
                'batches.name as batch_name'
            )
            ->orderBy('attendance_sessions.id', 'desc')
            ->first();

        if (!$session) {
            return response()->json([
                'active' => false,
            ]);
        }

        return response()->json([
            'active' => true,
            'session' => $session,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ENROLLMENTS
    |--------------------------------------------------------------------------
    */

    public function enrollments()
    {
        $student = DB::table('students')
            ->where('user_id', auth()->id())
            ->firstOrFail();
    
        $rows = DB::table('student_enrollments')
            ->join(
                'courses',
                'courses.id',
                '=',
                'student_enrollments.course_id'
            )
            ->join(
                'batches',
                'batches.id',
                '=',
                'student_enrollments.batch_id'
            )
            ->where(
                'student_enrollments.student_id',
                $student->id
            )
            ->whereIn(
                'student_enrollments.status',
                [
                    'active',
                    'completed',
                ]
            )
            ->select(
                'student_enrollments.id',
                'student_enrollments.course_id',
                'student_enrollments.batch_id',
                'student_enrollments.status',
                'courses.name as course_name',
                'batches.name as batch_name'
            )
            ->get();
    
        return response()->json($rows);
    }

    /*
    |--------------------------------------------------------------------------
    | HISTORY
    |--------------------------------------------------------------------------
    */

    public function history()
    {
        $student = DB::table('students')
            ->where('user_id', auth()->id())
            ->firstOrFail();
    
        $courseId = request('course_id');
        $batchId = request('batch_id');
    
        $query = DB::table('attendances')
            ->join(
                'attendance_sessions',
                'attendance_sessions.id',
                '=',
                'attendances.attendance_session_id'
            )
            ->join(
                'courses',
                'courses.id',
                '=',
                'attendance_sessions.course_id'
            )
            ->join(
                'batches',
                'batches.id',
                '=',
                'attendance_sessions.batch_id'
            )
            ->where(
                'attendances.student_id',
                $student->id
            );
    
        if ($courseId) {
    
            $query->where(
                'attendance_sessions.course_id',
                $courseId
            );
    
        }
    
        if ($batchId) {
    
            $query->where(
                'attendance_sessions.batch_id',
                $batchId
            );
    
        }
    
        $history = $query
            ->orderByDesc('attendance_sessions.starts_at')
            ->get([
                'attendances.id',
                'attendances.status',
                'attendances.marked_at',
                'attendance_sessions.session_date',
                'courses.name as course_name',
                'batches.name as batch_name',
            ]);
    
        $totalSessions = $history->count();
    
        $presentCount = $history
            ->where('status', 'present')
            ->count();
    
        $percentage = $totalSessions > 0
            ? round(($presentCount / $totalSessions) * 100, 2)
            : 0;
    
        return response()->json([
    
            'summary' => [
    
                'total_sessions' => $totalSessions,
    
                'present' => $presentCount,
    
                'percentage' => $percentage,
    
            ],
    
            'history' => $history,
    
        ]);
    }

}