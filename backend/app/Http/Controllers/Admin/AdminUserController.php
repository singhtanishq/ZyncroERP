<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\EmailService;

class AdminUserController extends Controller
{
    // ================= ADD USER =================
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role'  => ['required', 'in:student,faculty,franchise,admin,employee'],
        ]);

        $plainPassword = Str::random(32);

        $user = DB::transaction(function () use ($data, $plainPassword) {

            $user = User::create([
                'name'           => $data['name'],
                'email'          => strtolower($data['email']),
                'password'       => Hash::make($plainPassword),
                'role'           => $data['role'],
                'approve_status' => true,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Student Profile
            |--------------------------------------------------------------------------
            */

            if ($user->role === 'student') {

                Student::create([
                    'user_id' => $user->id,
                    'sid'     => $this->generateSid(),
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Faculty Profile
            |--------------------------------------------------------------------------
            */

            if ($user->role === 'faculty') {

                $last = Faculty::latest('id')
                    ->lockForUpdate()
                    ->first();

                $nextNumber = $last
                    ? ((int) substr($last->code, 3)) + 1
                    : 1;

                Faculty::create([
                    'user_id'        => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => '',
                    'qualification'  => null,
                    'specialization' => null,
                    'join_date'      => null,
                    'code'           => 'FAC' . str_pad(
                        $nextNumber,
                        4,
                        '0',
                        STR_PAD_LEFT
                    ),
                ]);
            }

            return $user;
        });

        /*
         | Sent after the transaction commits so a mail failure can never
         | roll back the created account.
         */
        app(EmailService::class)->userCredentials(
            $user->email,
            $user->name,
            $plainPassword,
            $user->role
        );

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user,
        ], 201);
    }

    // ================= LIST USERS =================
    public function index()
    {
        return User::select('id', 'name', 'email', 'role', 'approve_status')
            ->orderByDesc('id')
            ->get();
    }

    // ================= VIEW DETAILS =================
    public function show($id)
    {
        return User::findOrFail($id);
    }


    // ================= DELETE USER =================
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {

            $user = User::findOrFail($id);

            // Prevent deleting admin
            if ($user->role === 'admin') {
                return response()->json([
                    'message' => 'Cannot delete admin user'
                ], 403);
            }

            // Delete linked profile first

            if ($user->role === 'student') {
            
                Student::where(
                    'user_id',
                    $user->id
                )->delete();
            
            }
            
            if ($user->role === 'faculty') {
            
                Faculty::where(
                    'user_id',
                    $user->id
                )->delete();
            
            }
            
            // Franchise profile can be added later
            
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ]);
        });
    }

    // ================= RESET CREDENTIALS =================
    public function resetCredentials($id)
    {
        $user = User::findOrFail($id);

        $plainPassword = Str::random(32);

        $user->password = Hash::make($plainPassword);
        $user->save();

        app(EmailService::class)->userCredentials(
            $user->email,
            $user->name,
            $plainPassword,
            $user->role
        );

        return response()->json([
            'message' => 'Credentials reset and emailed'
        ]);
    }

    // ================= PENDING USERS =================
    public function pending()
    {
        return User::where('approve_status', false)
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderByDesc('id')
            ->get();
    }
    
    private function generateSid(): string
    {
        do {
    
            $sid = str_pad(
                (string) random_int(0, 99999999),
                8,
                '0',
                STR_PAD_LEFT
            );
    
        } while (
            Student::where('sid', $sid)->exists()
        );
    
        return $sid;
    }
    
}