<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentCommunication;
use Illuminate\Http\Request;

class StudentCommunicationController extends Controller
{
    public function index(Request $request)
    {
        $student = Student::where(
            'user_id',
            $request->user()->id
        )->firstOrFail();
        
        $activeEnrollments = $student
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
    
        $communications = StudentCommunication::with([
            'creator:id,name',
            'accessRules.course:id,name',
            'accessRules.batch:id,name',
        ])
        ->where('status', 'active')
        ->whereHas('accessRules', function ($query) use ($activeEnrollments) {
        
            $query->where('access_type', 'all');
        
            foreach ($activeEnrollments as $enrollment) {
        
                $query->orWhere(function ($q) use ($enrollment) {
        
                    $q->where('access_type', 'course')
                        ->where('course_id', $enrollment->course_id);
        
                });
        
                $query->orWhere(function ($q) use ($enrollment) {
        
                    $q->where('access_type', 'batch')
                        ->where('course_id', $enrollment->course_id)
                        ->where('batch_id', $enrollment->batch_id);
        
                });
        
            }
        
        })
        ->latest()
        ->get()
        ->map(function ($comm) use ($activeEnrollments) {

            $matchedEnrollment = $activeEnrollments->first(function ($enrollment) use ($comm) {
        
                foreach ($comm->accessRules as $rule) {
        
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
        
            $comm->student_course = $matchedEnrollment?->course;
            $comm->student_batch = $matchedEnrollment?->batch;
        
            return $comm;
        
        });
    
        return response()->json($communications);
    }
}