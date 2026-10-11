<?php

namespace App\Services\Faculty;

use App\Models\FacultyAssignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FacultyAssignmentService
{
    public static function faculty()
    {
        return \App\Models\Faculty::where(
            'user_id',
            auth()->id()
        )->firstOrFail();
    }

    public static function assignments()
    {
        $faculty = \App\Models\Faculty::where(
            'user_id',
            auth()->id()
        )->firstOrFail();
    
        return FacultyAssignment::where(
            'faculty_id',
            $faculty->id
        )->get();
    }
    
    public static function assignmentPairs(): Collection
    {
        return self::assignments()
            ->map(function ($assignment) {
    
                return [
                    'course_id' => $assignment->course_id,
                    'batch_id'  => $assignment->batch_id,
                ];
    
            });
    }

    public static function authorize(
        ?int $courseId,
        ?int $batchId = null
    ): void {

        $allowed = self::assignments();

        $authorized = $allowed->contains(function ($assignment) use (
            $courseId,
            $batchId
        ) {

            if ($batchId) {

                return
                    $assignment->course_id == $courseId
                    &&
                    $assignment->batch_id == $batchId;

            }

            return
                $assignment->course_id == $courseId;

        });

        abort_unless($authorized, 403);

    }
    
    public static function hasAssignment(
        int $courseId,
        int $batchId
    ): bool {
    
        return self::assignments()->contains(function ($assignment) use (
            $courseId,
            $batchId
        ) {
    
            return
                $assignment->course_id == $courseId
                &&
                $assignment->batch_id == $batchId;
    
        });
    
    }

    public static function applyAccessRules(
        Builder $query,
        string $relation = 'accessRules'
    ): Builder {

        $assignments = self::assignments();

        return $query->whereHas(
            $relation,
            function ($q) use ($assignments) {

                $q->where('access_type', 'all');

                foreach ($assignments as $assignment) {

                    $q->orWhere(function ($rule) use ($assignment) {

                        $rule->where(
                            'access_type',
                            'course'
                        )
                        ->where(
                            'course_id',
                            $assignment->course_id
                        );

                    });

                    $q->orWhere(function ($rule) use ($assignment) {

                        $rule->where(
                            'access_type',
                            'batch'
                        )
                        ->where(
                            'course_id',
                            $assignment->course_id
                        )
                        ->where(
                            'batch_id',
                            $assignment->batch_id
                        );

                    });

                }

            }
        );

    }
    
    public static function authorizeAccessRules(
        Model $model,
        string $relation = 'accessRules',
        bool $forWrite = false
    ): void {

        $allowed = self::assignments();

        $authorized = false;

        $model->loadMissing($relation);

        /*
         | A global ("all") rule makes content visible to every faculty member,
         | but it must not hand out write access to admin-created or other
         | faculty-created records. Writes require ownership or an exact
         | course/batch rule.
         */
        if ($forWrite && isset($model->created_by) && (int) $model->created_by === (int) auth()->id()) {
            return;
        }

        foreach ($model->$relation as $rule) {

            if ($rule->access_type === 'all' && ! $forWrite) {
                $authorized = true;
                break;
            }

            foreach ($allowed as $assignment) {

                if (
                    $rule->access_type === 'course'
                    &&
                    $rule->course_id == $assignment->course_id
                ) {

                    $authorized = true;
                    break 2;

                }

                if (
                    $rule->access_type === 'batch'
                    &&
                    $rule->course_id == $assignment->course_id
                    &&
                    $rule->batch_id == $assignment->batch_id
                ) {

                    $authorized = true;
                    break 2;

                }

            }

        }

        abort_unless($authorized, 403);

    }

    public static function applyCourseBatchFilter(
        Builder $query
    ): Builder {

        $assignments = self::assignments();

        // A faculty with no assignments must see nothing, not everything.
        if ($assignments->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function ($q) use ($assignments) {

            foreach ($assignments as $assignment) {

                $q->orWhere(function ($row) use ($assignment) {

                    $row->where(
                        'course_id',
                        $assignment->course_id
                    )
                    ->where(
                        'batch_id',
                        $assignment->batch_id
                    );

                });

            }

        });

    }
}