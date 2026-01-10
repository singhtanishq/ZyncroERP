<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudyMaterial;
use App\Models\OnlineClass;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\StudentDocument;
use App\Models\Certificate;
use App\Models\StudentFee;

class StudentDashboardController extends Controller
{
    public function index()
    {
        $student = Student::with([
            'user',
            'activeEnrollment.course',
            'activeEnrollment.batch',
        ])
        ->where(
            'user_id',
            auth()->id()
        )
        ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Resolve Dashboard State
        |--------------------------------------------------------------------------
        */
        
        $dashboardState = 'active';
        
        /*
        |--------------------------------------------------------------------------
        | Load all enrollments
        |--------------------------------------------------------------------------
        */
        
        $allEnrollments = $student
            ->enrollments()
            ->with([
                'course',
                'batch',
            ])
            ->orderByDesc('created_at')
            ->get();
        
        /*
        |--------------------------------------------------------------------------
        | Active enrollments only
        |--------------------------------------------------------------------------
        */
        
        $activeEnrollments = $allEnrollments
            ->where('status', 'active')
            ->values();
            
        /*
        |--------------------------------------------------------------------------
        | Dashboard state
        |--------------------------------------------------------------------------
        */
        
        if ($activeEnrollments->isEmpty()) {
        
            $enrollment = $student
                ->enrollments()
                ->with([
                    'course',
                    'batch',
                ])
                ->latest()
                ->first();
        
            if ($enrollment) {
        
                $dashboardState = 'pending';
        
            } else {
        
                $dashboardState = 'not_enrolled';
            }
        
        } else {
        
            $enrollment = $activeEnrollments->first();
        
        }
        
        /*
        |--------------------------------------------------------------------------
        | Active Course & Batch IDs
        |--------------------------------------------------------------------------
        */
        
        $courseIds = $activeEnrollments
            ->pluck('course_id')
            ->unique()
            ->values();
        
        $batchIds = $activeEnrollments
            ->pluck('batch_id')
            ->unique()
            ->values();
            
        /*
        ----------------------------------
        STUDY MATERIALS
        ----------------------------------
        */

        $studyMaterials = 0;

        if ($dashboardState === 'active') {
        
            $studyMaterials = StudyMaterial::query()
        
                ->where('status', 'active')
        
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
        
                ->count();
        
        }
        /*
        ----------------------------------
        ONLINE CLASSES
        ----------------------------------
        */

        $onlineClasses = 0;
        
        if ($dashboardState === 'active') {
        
            $onlineClasses = OnlineClass::query()
        
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
        
                ->count();
        
        }
        
        /*
        ----------------------------------
        ASSIGNMENTS
        ----------------------------------
        */
        
        $assignmentCount = 0;
        
        if ($dashboardState === 'active') {
        
            $assignmentCount = Assignment::query()
        
                ->where('status', 'active')
        
                ->where(function ($query) use ($activeEnrollments) {
        
                    foreach ($activeEnrollments as $enrollment) {
        
                        $query->orWhere(function ($q) use ($enrollment) {
        
                            $q->where(
                                'course_id',
                                $enrollment->course_id
                            )
        
                            ->where(
                                'batch_id',
                                $enrollment->batch_id
                            );
        
                        });
        
                    }
        
                })
        
                ->count();
        
        }
        
        $submittedAssignments =
            AssignmentSubmission::where(
                'student_id',
                $student->id
            )
            ->count();
            
        /*
        ----------------------------------
        CERTIFICATES
        ----------------------------------
        */

        $certificateCount =
            Certificate::where(
                'type',
                'course'
            )
            ->where(
                'certifiable_type',
                Student::class
            )
            ->where(
                'certifiable_id',
                $student->id
            )
            ->whereNotNull(
                'issued_at'
            )
            ->count();

        /*
        ----------------------------------
        PAYMENT
        ----------------------------------
        */
        
        $student->loadMissing([
            'fees',
            'enrollments.course',
            'enrollments.batch',
            'enrollments.enrollmentDocuments',
        ]);
        
        $paymentSummary = $student->enrollments
            ->map(function ($enrollment) use ($student) {
        
                $fee = $student->fees
                    ->where(
                        'course_id',
                        $enrollment->course_id
                    )
                    ->first();
        
                $paymentProof = $enrollment
                    ->enrollmentDocuments
                    ->where(
                        'document_type',
                        'payment_proof'
                    )
                    ->first();
        
                return [
        
                    'course_name' =>
                        $enrollment->course?->name,
        
                    'batch_name' =>
                        $enrollment->batch?->name,
        
                    'total_fees' =>
                        $fee?->total_fees ?? 0,
        
                    'paid_fees' =>
                        $fee?->paid_fees ?? 0,
        
                    'remaining_fees' =>
                        max(
                            ($fee?->total_fees ?? 0)
                            -
                            ($fee?->paid_fees ?? 0),
                            0
                        ),
        
                    'payment_status' =>
                        $fee?->status ?? 'pending',
        
                    'proof_status' =>
                        $paymentProof?->verification_status
                        ?? 'not_uploaded',
        
                ];
        
            })
            ->values();

        return response()->json([
            
            'dashboard_state' => $dashboardState,

            'student' => [

                'name' =>
                    $student->user?->name,

                'email' =>
                    $student->user?->email,

                'sid' =>
                    $student->sid,

                'course' =>
                    $enrollment?->course?->name,
                
                'batch' =>
                    $enrollment?->batch?->name,
                
                'enrollment_status' =>
                    $enrollment?->status,
    
            ],
            
            'pending_enrollment' => [

                'course' =>
                    $enrollment?->course?->name,
            
                'batch' =>
                    $enrollment?->batch?->name,
            
                'status' =>
                    'Pending',
            
            ],

            'learning' => [

                'study_materials' =>
                    $studyMaterials,

                'online_classes' =>
                    $onlineClasses,
            ],

            'examination' => [

                'assignments' =>
                    $assignmentCount,

                'submitted_assignments' =>
                    $submittedAssignments,
            ],

            'certificates' => [

                'issued' =>
                    $certificateCount,
            ],

            'active_enrollments' => $allEnrollments
                ->map(function ($enrollment) {
            
                    return [
            
                        'course' =>
                            $enrollment->course?->name,
            
                        'batch' =>
                            $enrollment->batch?->name,
            
                        'status' =>
                            $enrollment->status,
            
                    ];
            
                })
                ->values(),
            
            'payments' => $paymentSummary,
        ]);
    }
}