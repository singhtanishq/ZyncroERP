<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OnlineClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OnlineClassController extends Controller
{
    public function index(Request $request)
    {
        $now = now();

        $query = OnlineClass::with(['accessRules.course', 'accessRules.batch'])
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',

            'start_datetime'    => 'required|date',
            'duration_minutes'  => 'required|integer|min:1',

            'is_recurring'      => 'required|boolean',
            'recurring_days'    => 'nullable|array',

            'platform'          => 'required|in:zoom,teams,gmeet,other',
            'platform_name'     => 'nullable|string|max:255',

            'meeting_link'      => 'required|url',
            'meeting_id'        => 'nullable|string|max:100',
            'meeting_password'  => 'nullable|string|max:100',

            'remarks'           => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {

            $start = Carbon::parse($data['start_datetime']);
            $end   = $start->copy()->addMinutes($data['duration_minutes']);

            return OnlineClass::create([
                'title'             => $data['title'],
                'description'       => $data['description'] ?? null,

                'start_datetime'    => $start,
                'end_datetime'      => $end,
                'duration_minutes' => $data['duration_minutes'],

                'is_recurring'      => $data['is_recurring'],
                'recurring_days'    => $data['recurring_days'] ?? null,

                'platform'          => $data['platform'],
                'platform_name'     => match ($data['platform']) {
                    'gmeet' => 'Google Meet',
                    'teams' => 'Microsoft Teams',
                    'zoom'  => 'Zoom',
                    default => $data['platform_name'],
                },

                'meeting_link'      => $data['meeting_link'],
                'meeting_id'        => $data['meeting_id'] ?? null,
                'meeting_password'  => $data['meeting_password'] ?? null,
                'remarks'           => $data['remarks'] ?? null,

                'status'            => 'scheduled',
                'created_by'        => Auth::id(),
            ]);
        });
    }

    public function update(Request $request, $id)
    {
        $class = OnlineClass::findOrFail($id);

        $data = $request->validate([
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',

            'start_datetime'    => 'required|date',
            'duration_minutes'  => 'required|integer|min:1',

            'is_recurring'      => 'required|boolean',
            'recurring_days'    => 'nullable|array',

            'platform'          => 'required|in:zoom,teams,gmeet,other',
            'platform_name'     => 'nullable|string|max:255',

            'meeting_link'      => 'required|url',
            'meeting_id'        => 'nullable|string|max:100',
            'meeting_password'  => 'nullable|string|max:100',

            'remarks'           => 'nullable|string',
        ]);

        $start = Carbon::parse($data['start_datetime']);
        $end   = $start->copy()->addMinutes($data['duration_minutes']);

        $class->update([
            'title'             => $data['title'],
            'description'       => $data['description'] ?? null,

            'start_datetime'    => $start,
            'end_datetime'      => $end,
            'duration_minutes' => $data['duration_minutes'],

            'is_recurring'      => $data['is_recurring'],
            'recurring_days'    => $data['recurring_days'] ?? null,

            'platform'          => $data['platform'],
            'platform_name'     => match ($data['platform']) {
                'gmeet' => 'Google Meet',
                'teams' => 'Microsoft Teams',
                'zoom'  => 'Zoom',
                default => $data['platform_name'],
            },

            'meeting_link'      => $data['meeting_link'],
            'meeting_id'        => $data['meeting_id'] ?? null,
            'meeting_password'  => $data['meeting_password'] ?? null,
            'remarks'           => $data['remarks'] ?? null,
        ]);

        $class->syncStatus();

        return $class;
    }

    public function goLive($id)
    {
        $class = OnlineClass::findOrFail($id);

        $start = now();
        $end   = $start->copy()->addMinutes(
            $class->duration_minutes ?? 60
        );

        $class->update([
            'start_datetime' => $start,
            'end_datetime'   => $end,
            'status'         => 'live',
        ]);

        return response()->json([
            'message' => 'Class is now live',
        ]);
    }

    public function destroy($id)
    {
        $class = OnlineClass::findOrFail($id);

        DB::transaction(function () use ($class) {
            $class->accessRules()->delete();
            $class->delete();
        });

        return response()->json([
            'message' => 'Online class deleted successfully',
        ]);
    }
}
