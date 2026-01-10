<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CorporateAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CorporateAnnouncementController extends Controller
{
    public function index()
    {
        return CorporateAnnouncement::with('author:id,name')
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:10000',
            'status' => 'nullable|in:active,inactive',
        ]);

        $announcement = CorporateAnnouncement::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'status' => $data['status'] ?? 'active',
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Announcement published',
            'data' => $announcement->load('author:id,name'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = CorporateAnnouncement::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:10000',
            'status' => 'nullable|in:active,inactive',
        ]);

        $announcement->update($data);

        return response()->json([
            'message' => 'Announcement updated',
            'data' => $announcement->fresh()->load('author:id,name'),
        ]);
    }

    public function toggle($id)
    {
        $announcement = CorporateAnnouncement::findOrFail($id);

        $announcement->status = $announcement->status === 'active' ? 'inactive' : 'active';
        $announcement->save();

        return response()->json(['status' => $announcement->status]);
    }

    public function destroy($id)
    {
        CorporateAnnouncement::findOrFail($id)->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}
