<?php

namespace App\Http\Controllers\Faculty\Concerns;

use App\Services\Faculty\FacultyAssignmentService;

trait AuthorizesFacultyAssignments
{
    protected function authorizeAccess($model): void
    {
        FacultyAssignmentService::authorizeAccessRules($model);
    }

    /**
     * Mutating access (update / toggle / delete) requires ownership or an
     * exact course/batch rule — a global "all" visibility rule is not enough.
     */
    protected function authorizeAccessWrite($model): void
    {
        FacultyAssignmentService::authorizeAccessRules($model, 'accessRules', true);
    }

    protected function authorizeCourse(
        int $courseId,
        ?int $batchId = null
    ): void {

        FacultyAssignmentService::authorize(
            $courseId,
            $batchId
        );

    }
}