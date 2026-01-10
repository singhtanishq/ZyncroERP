<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailLog;
use Illuminate\Http\Request;
use App\Jobs\SendBulkEmailJob;

class AdminCommunicationController extends Controller
{
    // ================= USERS LIST =================
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('id', $search);
            });
        }

        return $query->select('id', 'name', 'email', 'role')
            ->orderByDesc('id')
            ->limit(100)
            ->get();
    }

    // ================= SEND BULK EMAIL =================
    public function send(Request $request)
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array'],
            'subject' => ['required'],
            'content' => ['required'],
        ]);

        $users = User::whereIn('id', $data['user_ids'])->get();

        foreach ($users as $user) {
            SendBulkEmailJob::dispatch($user->id, $data['subject'], $data['content']);
        }

        return response()->json([
            'message' => count($users) . ' emails sent successfully'
        ]);
    }

    // ================= EMAIL LOGS =================
    public function logs()
    {
        return EmailLog::latest()->limit(100)->get();
    }

    // ================= SINGLE LOG =================
    public function show($id)
    {
        return EmailLog::findOrFail($id);
    }
}