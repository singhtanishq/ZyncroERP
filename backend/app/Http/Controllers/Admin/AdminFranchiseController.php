<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Franchise;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminFranchiseController extends Controller
{
    public function index()
    {
        return Franchise::with('user:id,name,email,role')
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:franchises,code',
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'create_login' => 'nullable|boolean',
        ]);

        $franchise = null;

        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $request, &$franchise) {

            $userId = null;

            if (!empty($data['create_login']) && !empty($data['email'])) {

                $existing = User::where('email', strtolower($data['email']))->first();

                if ($existing) {
                    abort(422, 'A user with this email already exists. The franchise cannot claim this login.');
                }

                $plainPassword = Str::random(32);

                $user = User::create([
                    'name'           => $data['owner_name'],
                    'email'          => strtolower($data['email']),
                    'password'       => Hash::make($plainPassword),
                    'role'           => 'franchise',
                    'approve_status' => true,
                ]);

                $userId = $user->id;

                app(EmailService::class)->userCredentials(
                    $user->email,
                    $user->name,
                    $plainPassword,
                    'franchise'
                );
            }

            $franchise = Franchise::create($data + ['user_id' => $userId]);
        });

        return response()->json([
            'message' => 'Franchise created successfully',
            'franchise' => $franchise,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $franchise = Franchise::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:franchises,code,' . $franchise->id,
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $franchise->update($data);

        return $franchise;
    }

    public function toggle($id)
    {
        $franchise = Franchise::findOrFail($id);

        $franchise->status = $franchise->status === 'active' ? 'inactive' : 'active';
        $franchise->save();

        return response()->json(['status' => $franchise->status]);
    }

    public function destroy($id)
    {
        $franchise = Franchise::findOrFail($id);

        // Deleting the franchise must also retire its owner login.
        if ($franchise->user_id) {
            $user = User::find($franchise->user_id);
            if ($user) {
                $user->tokens()->delete();
                $user->delete();
            }
        }

        $franchise->delete();

        return response()->json([
            'message' => 'Franchise deleted successfully'
        ]);
    }
}
