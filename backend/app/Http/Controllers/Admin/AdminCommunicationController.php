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
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:20000'],
        ]);

        $users = User::whereIn('id', $data['user_ids'])->get();

        foreach ($users as $user) {
            SendBulkEmailJob::dispatch($user->id, $data['subject'], $data['content']);
        }

        /*
         | The jobs are queued, not delivered — report the queued count and
         | flag any requested ids that matched no user so the admin knows.
         */
        $skipped = count($data['user_ids']) - $users->count();

        $message = $users->count() . ' emails queued for delivery'
            . ($skipped > 0 ? " ({$skipped} selected id(s) matched no user and were skipped)." : '.');

        return response()->json([
            'message' => $message,
            'queued' => $users->count(),
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