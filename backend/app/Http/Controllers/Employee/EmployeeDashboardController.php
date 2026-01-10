<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\CorporateEmployee;
use Illuminate\Http\Request;

class EmployeeDashboardController extends Controller
{
    /**
     * Overview for the authenticated employee: their corporate profile,
     * employment details and issued certificates.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $employee = CorporateEmployee::with(['role', 'certificates'])
            ->where('user_id', $user->id)
            ->first();

        $certificates = collect();

        if ($employee) {
            $certificates = $employee->certificates
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'certificate_number' => $c->certificate_number,
                    'certificate_name' => $c->certificate_name,
                    'issued_date' => $c->issued_date,
                    'file_url' => $c->certificate_file ? asset($c->certificate_file) : null,
                    'view_url' => "/api/corporate-certificate/{$c->certificate_number}/view",
                    'download_url' => "/api/corporate-certificate/{$c->certificate_number}/download",
                ]);
        }

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'joined_at' => $user->created_at,
            ],
            'profile' => $employee ? [
                'employee_id' => $employee->employee_id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'department' => $employee->department,
                'joining_date' => $employee->joining_date,
                'status' => $employee->status,
                'corporate_role' => $employee->role?->name,
            ] : null,
            'stats' => [
                'certificates' => $certificates->count(),
            ],
            'certificates' => $certificates,
        ]);
    }
}
