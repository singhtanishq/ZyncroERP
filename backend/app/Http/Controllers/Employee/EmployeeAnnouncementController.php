<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\CorporateAnnouncement;
use Illuminate\Http\Request;

class EmployeeAnnouncementController extends Controller
{
    /**
     * Active company announcements, newest first.
     */
    public function index(Request $request)
    {
        $announcements = CorporateAnnouncement::with('author:id,name')
            ->where('status', 'active')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'author' => $a->author?->name,
                'published_at' => $a->created_at,
            ]);

        return response()->json(['data' => $announcements]);
    }
}
