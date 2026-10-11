<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Franchise;
use App\Models\FranchisePayment;
use App\Models\FranchiseCommission;
use Illuminate\Http\Request;

class AdminFranchisePaymentController extends Controller
{
    /* ================= INDEX ================= */
    public function index()
    {
        $franchises = Franchise::get();

        $payments = FranchisePayment::get()->keyBy('franchise_id');

        $commission = optional(\App\Models\FranchiseCommission::first())->commission ?? 0;

        return [
            'commission' => $commission,
            'data' => $franchises->map(function ($f) use ($payments, $commission) {
                $p = $payments[$f->id] ?? null;

                $totalRevenue = $p->total_amount ?? 0;
                $paid = $p->paid_amount ?? 0;

                $due = ($totalRevenue * $commission) / 100;

                $status = 'pending';
                if ($paid > 0 && $paid < $due) $status = 'partial';
                if ($paid >= $due && $due > 0) $status = 'paid';

                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'code' => $f->code,
                    'owner' => $f->owner_name,

                    'total_revenue' => $totalRevenue,
                    'amount_due' => round($due, 2),
                    'paid_amount' => $paid,
                    'status' => $status,
                ];
            }),
        ];
    }

    /* ================= UPDATE PAYMENT ================= */
    public function update(Request $request, $id)
    {
        $franchise = Franchise::find($id);

        if (! $franchise) {
            return response()->json(['message' => 'Franchise not found.'], 404);
        }

        $data = $request->validate([
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        if ($data['paid_amount'] > $data['total_amount']) {
            return response()->json([
                'message' => 'Paid amount cannot exceed the recorded total.',
            ], 422);
        }

        $payment = FranchisePayment::updateOrCreate(
            ['franchise_id' => $franchise->id],
            [
                'total_amount' => $data['total_amount'],
                'paid_amount' => $data['paid_amount'],
            ]
        );

        // Keep the persisted status in sync with what index() derives.
        $commission = optional(FranchiseCommission::first())->commission ?? 0;
        $due = ($payment->total_amount * $commission) / 100;

        $status = 'pending';
        if ($payment->paid_amount > 0 && $payment->paid_amount < $due) $status = 'partial';
        if ($due > 0 && $payment->paid_amount >= $due) $status = 'paid';

        $payment->update(['status' => $status]);

        return $payment->fresh();
    }

    /* ================= UPDATE COMMISSION ================= */
    public function updateCommission(Request $request)
    {
        $data = $request->validate([
            'commission' => 'required|numeric|min:0|max:100',
        ]);
    
        $row = \App\Models\FranchiseCommission::first();
    
        if ($row) {
            $row->update(['commission' => $data['commission']]);
        } else {
            $row = \App\Models\FranchiseCommission::create([
                'commission' => $data['commission']
            ]);
        }
    
        return response()->json([
            'message' => 'Commission updated',
            'data' => $row
        ]);
    }
}