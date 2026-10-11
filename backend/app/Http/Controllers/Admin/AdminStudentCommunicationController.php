<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentCommunication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AdminStudentCommunicationController extends Controller
{
    /* ================= LIST ================= */

    public function index()
    {
        return StudentCommunication::with([
            'creator:id,name',
            'accessRules.course:id,name',
            'accessRules.batch:id,name',
        ])
        ->orderByDesc('created_at')
        ->get();
    }

    /* ================= STORE ================= */

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        return DB::transaction(function () use ($data) {

            return StudentCommunication::create([
                'title' => $data['title'],
                'message' => $data['message'],
                'status' => 'active',
                'created_by' => Auth::id(),
            ]);

        });
    }

    /* ================= UPDATE ================= */

    public function update(Request $request, $id)
    {
        $communication = StudentCommunication::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $communication->update($data);

        return $communication->fresh();
    }

    /* ================= TOGGLE ================= */

    public function toggle($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        $communication->status =
            $communication->status === 'active'
                ? 'inactive'
                : 'active';

        $communication->save();

        return response()->json([
            'status' => $communication->status,
        ]);
    }

    /* ================= DELETE ================= */

    public function destroy($id)
    {
        $communication = StudentCommunication::findOrFail($id);

        DB::transaction(function () use ($communication) {

            $communication->accessRules()->delete();

            $communication->delete();

        });

        return response()->json([
            'message' => 'Communication deleted successfully.',
        ], Response::HTTP_OK);
    }
}