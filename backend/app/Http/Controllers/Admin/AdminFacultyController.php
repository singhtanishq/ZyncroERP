<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminFacultyController extends Controller
{
    public function index()
    {
        return Faculty::select(
                'id',
                'user_id',
                'code',
                'name',
                'phone',
                'email',
                'qualification',
                'specialization',
                'join_date'
            )
            ->orderBy('name')
            ->get();
    }

    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => [
                'nullable',
                'email',
                'max:255',
                // The login email (users.email) is the single source of truth;
                // syncing below keeps the faculty profile in step with it.
                Rule::unique('users', 'email')->ignore($faculty->user_id),
            ],
            'qualification' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'join_date' => 'nullable|date',
            'franchise_id' => 'nullable|exists:franchises,id',
        ]);

        return DB::transaction(function () use ($faculty, $data) {

            $faculty->update($data);

            if (array_key_exists('email', $data) && $faculty->user_id) {
                User::where('id', $faculty->user_id)->update([
                    'email' => strtolower((string) $data['email']),
                    'name' => $data['name'],
                ]);
            }

            return $faculty;
        });
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
        
            $faculty = Faculty::findOrFail($id);
        
            $userId = $faculty->user_id;
        
            /*
            |--------------------------------------------------------------------------
            | Future Safety
            |--------------------------------------------------------------------------
            |
            | Later we will block deletion if faculty is assigned to
            | any course / batch.
            |
            */
        
            $faculty->delete();
        
            if ($userId) {
                User::where('id', $userId)->delete();
            }
        
            return response()->json([
                'message' => 'Faculty deleted successfully'
            ]);
        });
    }
}