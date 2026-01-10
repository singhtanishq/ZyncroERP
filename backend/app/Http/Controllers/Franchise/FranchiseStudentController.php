<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use Illuminate\Http\Request;

class FranchiseStudentController extends Controller
{
    use ResolvesFranchise;

    /**
     * Students enrolled through this franchise, with enrollment and fee
     * status. Supports search and pagination.
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

        $query = $franchise->students()
            ->with([
                'user:id,name,email',
                'enrollments' => function ($q) {
                    $q->with(['course:id,name', 'batch:id,name'])
                        ->orderByDesc('id');
                },
                'fees:id,student_id,course_id,total_fees,paid_fees,status',
            ])
            ->orderByDesc('id');

        if (!empty($data['search'])) {
            $search = $data['search'];
            $query->where(function ($q) use ($search) {
                $q->where('sid', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (($data['status'] ?? 'all') !== 'all') {
            $query->whereHas('enrollments', function ($q) use ($data) {
                $q->where('status', $data['status']);
            });
        }

        $students = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($students->items())->map(function ($student) {
                $latestEnrollment = $student->enrollments->first();

                $feesTotal = (float) $student->fees->sum('total_fees');
                $feesPaid = (float) $student->fees->sum('paid_fees');

                return [
                    'id' => $student->id,
                    'sid' => $student->sid,
                    'name' => $student->user?->name,
                    'email' => $student->user?->email,
                    'course_name' => $latestEnrollment?->course?->name,
                    'batch_name' => $latestEnrollment?->batch?->name,
                    'enrollment_status' => $latestEnrollment?->status ?? 'not_enrolled',
                    'payment_status' => $latestEnrollment?->payment_status,
                    'fees_total' => $feesTotal,
                    'fees_paid' => $feesPaid,
                    'fees_outstanding' => max(0, $feesTotal - $feesPaid),
                ];
            }),
            'meta' => [
                'current_page' => $students->currentPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
                'last_page' => $students->lastPage(),
            ],
        ]);
    }
}
