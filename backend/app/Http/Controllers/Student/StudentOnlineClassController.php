<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\OnlineClass;
use App\Models\Student;

class StudentOnlineClassController extends Controller
{
    public function index()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();
        
        $activeEnrollments = $student
            ->enrollments()
            ->with([
                'course',
                'batch',
            ])
            ->where('status', 'active')
            ->get();
        
        if ($activeEnrollments->isEmpty()) {
            return [];
        }
        
        $courseIds = $activeEnrollments
            ->pluck('course_id')
            ->unique()
            ->values();
        
        $batchIds = $activeEnrollments
            ->pluck('batch_id')
            ->unique()
            ->values();

        $classes = OnlineClass::query()
            ->whereHas(
                'accessRules',
                function ($q) use (
                    $courseIds,
                    $batchIds
                ) {
            
                    $q->where('access_type', 'all')
            
                    ->orWhere(function ($q) use ($courseIds) {
            
                        $q->where(
                            'access_type',
                            'course'
                        )
                        ->whereIn(
                            'course_id',
                            $courseIds
                        );
            
                    })
            
                    ->orWhere(function ($q) use (
                        $courseIds,
                        $batchIds
                    ) {
            
                        $q->where(
                            'access_type',
                            'batch'
                        )
                        ->whereIn(
                            'course_id',
                            $courseIds
                        )
                        ->whereIn(
                            'batch_id',
                            $batchIds
                        );
            
                    });
            
                }
            )
            ->with('accessRules')
            ->latest()
            ->get();

        return $classes->map(function ($class) use ($activeEnrollments) {

            $class->syncStatus();
        
            $matchedEnrollment = $activeEnrollments->first(function ($enrollment) use ($class) {
        
                foreach ($class->accessRules as $rule) {
        
                    if ($rule->access_type === 'all') {
                        return true;
                    }
        
                    if (
                        $rule->access_type === 'course' &&
                        $rule->course_id == $enrollment->course_id
                    ) {
                        return true;
                    }
        
                    if (
                        $rule->access_type === 'batch' &&
                        $rule->course_id == $enrollment->course_id &&
                        $rule->batch_id == $enrollment->batch_id
                    ) {
                        return true;
                    }
        
                }
        
                return false;
        
            });
        
            $class->student_course = $matchedEnrollment?->course;
            $class->student_batch = $matchedEnrollment?->batch;
        
            return $class;
        
        });
    }
    
    public function show($id)
    {
        $student = \App\Models\Student::where(
            'user_id',
            auth()->id()
        )
        ->firstOrFail();

        // Match against EVERY active enrollment (the index list does the
        // same), so students with multiple enrollments can open everything
        // they are entitled to.
        $activeEnrollments = $student
            ->enrollments()
            ->with(['course', 'batch'])
            ->where('status', 'active')
            ->get();

        if ($activeEnrollments->isEmpty()) {
            abort(403);
        }

        $courseIds = $activeEnrollments->pluck('course_id')->unique()->values();
        $batchIds = $activeEnrollments->pluck('batch_id')->unique()->values();

        $class = \App\Models\OnlineClass::query()
            ->whereHas(
                'accessRules',
                function ($q) use ($courseIds, $batchIds) {
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
                }
            )
            ->with('accessRules')
            ->findOrFail($id);

        $class->syncStatus();

        $matchedEnrollment = $activeEnrollments->first(function ($enrollment) use ($class) {

            foreach ($class->accessRules as $rule) {

                if ($rule->access_type === 'all') {
                    return true;
                }

                if ($rule->access_type === 'course' && $rule->course_id == $enrollment->course_id) {
                    return true;
                }

                if (
                    $rule->access_type === 'batch' &&
                    $rule->course_id == $enrollment->course_id &&
                    $rule->batch_id == $enrollment->batch_id
                ) {
                    return true;
                }

            }

            return false;

        });

        $class->student_course = $matchedEnrollment?->course;
        $class->student_batch = $matchedEnrollment?->batch;

        return $class;
    }
}