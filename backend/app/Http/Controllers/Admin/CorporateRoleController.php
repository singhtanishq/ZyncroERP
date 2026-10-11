<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CorporateRole;

class CorporateRoleController extends Controller
{
    public function index()
    {
        return response()->json(CorporateRole::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:corporate_roles,name',
            'description' => 'nullable|string|max:2000',
        ]);

        $role = CorporateRole::create($data);

        return response()->json([
            'message' => 'Role created',
            'data' => $role
        ]);
    }

    public function update(Request $request, $id)
    {
        $role = CorporateRole::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:corporate_roles,name,' . $role->id,
            'description' => 'nullable|string|max:2000',
        ]);

        $role->update($data);

        return response()->json([
            'message' => 'Role updated'
        ]);
    }

    public function destroy($id)
    {
        /*
         | corporate_employees.role_id cascades on delete — removing a role
         | in use would silently delete every employee holding it.
         */
        $inUse = \App\Models\CorporateEmployee::where('role_id', $id)->exists();

        if ($inUse) {
            return response()->json([
                'message' => 'This role is assigned to one or more employees. Deletion not allowed.',
            ], 409);
        }

        CorporateRole::destroy($id);

        return response()->json([
            'message' => 'Role deleted'
        ]);
    }
}