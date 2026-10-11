<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FacultyCreateController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'email'          => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
                'unique:faculties,email',
            ],
            'qualification'  => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'join_date'      => 'nullable|date',
            'franchise_id'   => 'nullable|exists:franchises,id',
        ]);

        $plainPassword = Str::random(32);

        $faculty = DB::transaction(function () use ($data, $plainPassword) {

            $user = User::create([
                'name'           => $data['name'],
                'email'          => strtolower($data['email']),
                'password'       => Hash::make($plainPassword),
                'role'           => 'faculty',
                'approve_status' => true,
            ]);

            $lastFaculty = Faculty::latest('id')
                ->lockForUpdate()
                ->first();

            $nextNumber = $lastFaculty
                ? ((int) substr($lastFaculty->code, 3)) + 1
                : 1;

            return Faculty::create([
                'user_id'        => $user->id,
                'franchise_id'   => $data['franchise_id'] ?? null,
                'name'           => $data['name'],
                'code'           => 'FAC' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT),
                'phone'          => $data['phone'],
                'email'          => strtolower($data['email']),
                'qualification'  => $data['qualification'],
                'specialization' => $data['specialization'],
                'join_date'      => $data['join_date'],
            ]);
        });

        $mailResult = app(EmailService::class)->userCredentials(
            strtolower($data['email']),
            $data['name'],
            $plainPassword,
            'faculty'
        );

        $message = 'Faculty created successfully.';

        if (! ($mailResult['ok'] ?? false)) {
            $message .= ' However, the credentials email could not be sent — use "Reset Login" to re-send.';
        }

        return response()->json([
            'message' => $message,
            'faculty' => $faculty,
        ], 201);
    }
}