<?php

namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Franchise\Concerns\ResolvesFranchise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FranchisePaymentController extends Controller
{
    use ResolvesFranchise;

    /**
     * Revenue records maintained for this franchise by the administration.
     */
    public function index()
    {
        $franchise = $this->franchise();

        $payments = DB::table('franchise_payments')
            ->where('franchise_id', $franchise->id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($row) {
                $total = (float) $row->total_amount;
                $paid = (float) $row->paid_amount;

                return [
                    'id' => $row->id,
                    'total_amount' => $total,
                    'paid_amount' => $paid,
                    'outstanding' => max(0, $total - $paid),
                    'status' => $row->status,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ];
            });

        return response()->json([
            'data' => $payments,
            'summary' => [
                'total' => (float) $payments->sum('total_amount'),
                'paid' => (float) $payments->sum('paid_amount'),
                'outstanding' => (float) $payments->sum('outstanding'),
            ],
        ]);
    }

    /**
     * The commission rate with the current estimated share of collected
     * fees from this franchise's students.
     */
    public function commission()
    {
        $franchise = $this->franchise();

        $rate = (float) (DB::table('franchise_commissions')->value('commission') ?? 0);

        $studentIds = $franchise->students()->pluck('id');

        $collected = (float) DB::table('student_fees')
            ->whereIn('student_id', $studentIds)
            ->sum('paid_fees');

        return response()->json([
            'commission_rate' => $rate,
            'collected_fees' => $collected,
            'estimated_commission' => round($collected * ($rate / 100), 2),
        ]);
    }

    /**
     * Monthly fee collection across this franchise's students (last 12 months).
     */
    public function revenueReport(Request $request)
    {
        $franchise = $this->franchise();

        $studentIds = $franchise->students()->pluck('id');

        $rows = DB::table('student_fees')
            ->whereIn('student_id', $studentIds)
            ->where('updated_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') AS month, COALESCE(SUM(paid_fees), 0) AS collected")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'data' => $rows->map(fn ($r) => [
                'month' => $r->month,
                'collected' => (float) $r->collected,
            ]),
        ]);
    }
}
