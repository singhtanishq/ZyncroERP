<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

class FranchiseEnrollmentController extends Controller
{
    use ResolvesFranchise;

    /**
     * All enrollments belonging to this franchise's students, with search,
     * status filtering and pagination.
     */
    public function index(Request $request)
    {
        $franchise = $this->franchise();

        $data = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:all,pending,active,completed,cancelled',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $data['per_page'] ?? 10;
        $studentIds = $franchise->students()->pluck('id');

        $query = StudentEnrollment::with([
                'student:id,sid,user_id,franchise_id',
                'student.user:id,name,email',
                'course:id,name,code',
                'batch:id,name',
            ])
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('id');

        if (!empty($data['search'])) {
            $search = $data['search'];

            $query->where(function ($q) use ($search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('sid', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                })->orWhereHas('course', function ($cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });
        }

        if (($data['status'] ?? 'all') !== 'all') {
            $query->where('status', $data['status']);
        }

        $enrollments = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($enrollments->items())->map(fn ($e) => [
                'id' => $e->id,
                'student_name' => $e->student?->user?->name,
                'sid' => $e->student?->sid,
                'course_name' => $e->course?->name,
                'batch_name' => $e->batch?->name,
                'joined_at' => $e->joined_at,
                'status' => $e->status,
                'payment_status' => $e->payment_status,
            ]),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
                'last_page' => $enrollments->lastPage(),
            ],
        ]);
    }
}
