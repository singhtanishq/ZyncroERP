<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Admin\OnlineClassController as AdminOnlineClassController;
use App\Models\OnlineClass;
use App\Services\Faculty\FacultyAssignmentService;
use Illuminate\Http\Request;

class FacultyOnlineClassController extends AdminOnlineClassController
{
    public function index(Request $request)
    {
        $now = now();

        $query = FacultyAssignmentService::applyAccessRules(
            OnlineClass::with([
                'accessRules.course',
                'accessRules.batch',
            ])
        )
        ->orderBy('start_datetime', 'desc');

        if ($request->filter === 'upcoming') {
            $query->where('start_datetime', '>', $now);
        }

        if ($request->filter === 'live') {
            $query->whereNotNull('end_datetime')
                ->where('start_datetime', '<=', $now)
                ->where('end_datetime', '>=', $now);
        }

        if ($request->filter === 'past') {
            $query->whereNotNull('end_datetime')
                ->where('end_datetime', '<', $now);
        }

        $classes = $query->get();

        foreach ($classes as $class) {
            $class->syncStatus();
        }

        return $classes;
    }

    public function update(Request $request, $id)
    {
        $class = OnlineClass::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($class, 'accessRules', true);

        return parent::update($request, $id);
    }

    public function goLive($id)
    {
        $class = OnlineClass::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($class, 'accessRules', true);

        return parent::goLive($id);
    }

    public function destroy($id)
    {
        $class = OnlineClass::with('accessRules')
            ->findOrFail($id);

        FacultyAssignmentService::authorizeAccessRules($class, 'accessRules', true);

        return parent::destroy($id);
    }
}