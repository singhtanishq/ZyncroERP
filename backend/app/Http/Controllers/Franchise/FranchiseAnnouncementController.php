<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use App\Models\StudentCommunication;
use Illuminate\Http\Request;

class FranchiseAnnouncementController extends Controller
{
    use ResolvesFranchise;

    /**
     * Student communications that target this franchise's students —
     * matched through the same access-rule model students see.
     */
    public function index(Request $request)
    {
        $franchise = $this->franchise();

        $enrollments = $franchise->students()
            ->with('enrollments:id,student_id,course_id,batch_id,status')
            ->get(['id'])
            ->flatMap->enrollments;

        $communications = StudentCommunication::with([
                'creator:id,name',
                'accessRules.course:id,name',
                'accessRules.batch:id,name',
            ])
            ->where('status', 'active')
            ->orderByDesc('id')
            ->get()
            ->filter(function ($comm) use ($enrollments) {
                foreach ($enrollments as $enrollment) {
                    foreach ($comm->accessRules as $rule) {
                        if ($rule->access_type === 'all') {
                            return true;
                        }

                        if ($rule->access_type === 'course' && $rule->course_id == $enrollment->course_id) {
                            return true;
                        }

                        if (
                            $rule->access_type === 'batch'
                            && $rule->course_id == $enrollment->course_id
                            && $rule->batch_id == $enrollment->batch_id
                        ) {
                            return true;
                        }
                    }
                }

                return false;
            })
            ->values()
            ->map(fn ($comm) => [
                'id' => $comm->id,
                'title' => $comm->title,
                'message' => $comm->message,
                'published_by' => $comm->creator?->name,
                'published_at' => $comm->created_at,
                'audience' => $comm->accessRules->map(function ($rule) {
                    if ($rule->access_type === 'all') {
                        return 'All students';
                    }

                    $course = $rule->course?->name ?? 'Course';

                    return $rule->access_type === 'course'
                        ? $course
                        : ($course . ' — ' . ($rule->batch?->name ?? 'Batch'));
                })->unique()->values()->all(),
            ]);

        return response()->json(['data' => $communications]);
    }
}
