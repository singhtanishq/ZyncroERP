<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CorporateEmployee;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CorporateEmployeeController extends Controller
{
    public function index()
    {
        return response()->json(
            CorporateEmployee::with(['role', 'user:id,name,email,role'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:corporate_employees,email',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:corporate_roles,id',
            'department' => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive',
            'create_login' => 'nullable|boolean',
        ]);

        $data['employee_id'] = $this->nextEmployeeId();
        $data['status'] = $data['status'] ?? 'active';

        $employee = DB::transaction(function () use ($data, $request) {

            $userId = null;

            if (($data['create_login'] ?? true)) {

                if (User::where('email', strtolower($data['email']))->exists()) {
                    abort(422, 'A login account with this email already exists.');
                }

                $plainPassword = Str::random(32);

                $user = User::create([
                    'name'           => $data['name'],
                    'email'          => strtolower($data['email']),
                    'password'       => Hash::make($plainPassword),
                    'role'           => 'employee',
                    'approve_status' => true,
                ]);

                $userId = $user->id;

                app(EmailService::class)->userCredentials(
                    $user->email,
                    $user->name,
                    $plainPassword,
                    'employee'
                );
            }

            return CorporateEmployee::create($data + ['user_id' => $userId]);
        });

        return response()->json([
            'message' => 'Employee added',
            'data' => $employee->load('role'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $employee = CorporateEmployee::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:corporate_employees,email,' . $employee->id,
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:corporate_roles,id',
            'department' => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive',
        ]);

        $employee->update($data);

        return response()->json([
            'message' => 'Employee updated'
        ]);
    }

    private function nextEmployeeId(): string
    {
        $latest = CorporateEmployee::orderByDesc('id')->first();

        $next = $latest
            ? ((int) filter_var($latest->employee_id, FILTER_SANITIZE_NUMBER_INT)) + 1
            : 1;

        return 'EMP' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    public function destroy($id)
    {
        CorporateEmployee::destroy($id);

        return response()->json([
            'message' => 'Employee deleted'
        ]);
    }
}