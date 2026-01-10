<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyBatchController extends Controller
{
    public function listByCourse($courseId)
    {
        FacultyAssignmentService::authorize($courseId);

        $batchIds = FacultyAssignmentService::assignments()
            ->where('course_id', $courseId)
            ->pluck('batch_id');

        return Batch::where('course_id', $courseId)
            ->whereIn('id', $batchIds)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }
}