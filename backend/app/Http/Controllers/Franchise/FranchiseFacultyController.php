<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use Illuminate\Http\Request;

class FranchiseFacultyController extends Controller
{
    use ResolvesFranchise;

    /**
     * Faculty members belonging to this franchise, with a summary of their
     * course/batch assignments.
     */
    public function index(Request $request)
    {
        $franchise = $this->franchise();

        $data = $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $query = $franchise->faculties()
            ->with(['assignments:id,faculty_id,course_id,batch_id'])
            ->orderBy('name');

        if (!empty($data['search'])) {
            $search = $data['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $faculty = $query->get()->map(fn ($f) => [
            'id' => $f->id,
            'code' => $f->code,
            'name' => $f->name,
            'email' => $f->email,
            'phone' => $f->phone,
            'specialization' => $f->specialization,
            'join_date' => $f->join_date,
            'assignments_count' => $f->assignments->count(),
        ]);

        return response()->json(['data' => $faculty]);
    }
}
