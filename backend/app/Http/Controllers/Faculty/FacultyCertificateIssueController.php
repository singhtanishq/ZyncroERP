<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\AdminCertificateIssueController;
use App\Models\Certificate;
use App\Services\Faculty\FacultyAssignmentService;

class FacultyCertificateIssueController extends AdminCertificateIssueController
{
    public function index()
    {
        $query = Certificate::with([
                'certifiable.user:id,name',
                'course:id,name',
                'batch:id,name',
                'exam:id,name',
            ])
            ->where('type', 'course')
            ->orderByDesc('created_at');

        FacultyAssignmentService::applyCourseBatchFilter($query);

        return $query->get();
    }

    public function issue(Certificate $certificate)
    {
        FacultyAssignmentService::authorize(
            $certificate->course_id,
            $certificate->batch_id
        );

        return parent::issue($certificate);
    }
}