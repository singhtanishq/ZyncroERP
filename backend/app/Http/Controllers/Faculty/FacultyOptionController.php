<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Services\Faculty\FacultyAssignmentService;
use App\Models\Course;
use App\Models\Batch;

class FacultyOptionController extends Controller
{
    public function courses()
    {
        $assignments = FacultyAssignmentService::assignments();

        $courseIds = $assignments
            ->pluck('course_id')
            ->unique()
            ->values();

        return Course::whereIn('id', $courseIds)
            ->where('status', 'active')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'status',
            ]);
    }

    public function batches($courseId)
    {
        FacultyAssignmentService::authorize(
            $courseId
        );

        $assignments = FacultyAssignmentService::assignments()
            ->where('course_id', $courseId);

        $batchIds = $assignments
            ->pluck('batch_id')
            ->filter()
            ->unique()
            ->values();

        return Batch::whereIn('id', $batchIds)
            ->where('status', 'active')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'status',
            ]);
    }
}