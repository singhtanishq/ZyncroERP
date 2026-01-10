<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AttendanceSessionController as AdminAttendanceSessionController;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyAttendanceSessionController extends AdminAttendanceSessionController
{
    public function start(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);

        FacultyAssignmentService::authorize(
            $data['course_id'],
            $data['batch_id']
        );

        return parent::start($request);
    }

    public function report(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'batch_id'  => 'required|exists:batches,id',
        ]);

        FacultyAssignmentService::authorize(
            $data['course_id'],
            $data['batch_id']
        );

        return parent::report($request);
    }

    public function end(Request $request)
    {
        $data = $request->validate([
            'session_id' => 'required|exists:attendance_sessions,id',
        ]);

        $session = \Illuminate\Support\Facades\DB::table('attendance_sessions')
            ->where('id', $data['session_id'])
            ->first();

        abort_unless($session, 404, 'Attendance session not found');

        FacultyAssignmentService::authorize(
            $session->course_id,
            $session->batch_id
        );

        return parent::end($request);
    }
}