<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudyMaterial;
use App\Models\Student;

class StudentStudyMaterialController extends Controller
{
    public function index()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();
        
        $enrollments = $student
            ->enrollments()
            ->with([
                'course',
                'batch',
            ])
            ->whereIn('status', [
                'active',
                'completed',
            ])
            ->get();
        
        if ($enrollments->isEmpty()) {
            return [];
        }
        
        $courseIds = $enrollments
            ->pluck('course_id')
            ->unique();
        
        $batchIds = $enrollments
            ->pluck('batch_id')
            ->filter()
            ->unique();

        $materials = StudyMaterial::query()
            ->where('status', 'active')
            ->whereHas('accessRules', function ($q) use ($courseIds, $batchIds) {

                $q->where('access_type', 'all')
            
                ->orWhere(function ($q) use ($courseIds) {
            
                    $q->where('access_type', 'course')
                      ->whereIn('course_id', $courseIds);
            
                })
            
                ->orWhere(function ($q) use ($courseIds, $batchIds) {
            
                    $q->where('access_type', 'batch')
                      ->whereIn('course_id', $courseIds)
                      ->whereIn('batch_id', $batchIds);
            
                });
            
            })
            ->with([
                'creator:id,name',
                'accessRules.course',
                'accessRules.batch',
            ])
            ->latest()
            ->get();

        return $materials->map(function ($m) {

            if ($m->type === 'pdf') {
                $m->view_url = url("/api/student/study-materials/{$m->id}/view");
            }

            $rule = $m->accessRules->first();

            $m->student_course = $rule?->course;
            $m->student_batch = $rule?->batch;

            return $m;
        });
    }
}