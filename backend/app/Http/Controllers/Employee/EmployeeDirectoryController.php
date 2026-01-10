<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\CorporateEmployee;
use Illuminate\Http\Request;

class EmployeeDirectoryController extends Controller
{
    /**
     * Company directory: active colleagues grouped by their corporate role.
     * Read-only, available to every authenticated employee.
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $query = CorporateEmployee::with('role:id,name')
            ->where('status', 'active')
            ->orderBy('name');

        if (!empty($data['search'])) {
            $search = $data['search'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%")
                    ->orWhereHas('role', fn ($r) => $r->where('name', 'like', "%{$search}%"));
            });
        }

        $employees = $query->get()->map(fn ($e) => [
            'id' => $e->id,
            'employee_id' => $e->employee_id,
            'name' => $e->name,
            'department' => $e->department,
            'joining_date' => $e->joining_date,
            'corporate_role' => $e->role?->name,
        ]);

        return response()->json(['data' => $employees]);
    }
}
