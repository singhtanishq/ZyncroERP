<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentEnrollment;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentPaymentController extends Controller
{
    public function markPaid(Request $request, $enrollmentId)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($enrollmentId, $data) {

            $enrollment = StudentEnrollment::with([
                'enrollmentDocuments',
                'course'
            ])->findOrFail($enrollmentId);

            $paymentProof = $enrollment->enrollmentDocuments
                ->where('document_type', 'payment_proof')
                ->first();

            if (
                !$paymentProof ||
                $paymentProof->verification_status !== 'verified'
            ) {
                return response()->json([
                    'message' => 'Payment proof must be verified first.'
                ], 422);
            }

            $fee = StudentFee::where('student_id', $enrollment->student_id)
                ->where('course_id', $enrollment->course_id)
                ->firstOrFail();

            $fee->paid_fees += $data['amount'];

            if ($fee->paid_fees > $fee->total_fees) {
                $fee->paid_fees = $fee->total_fees;
            }

            if ($fee->paid_fees <= 0) {
                $fee->status = 'pending';
            } elseif ($fee->paid_fees < $fee->total_fees) {
                $fee->status = 'partial';
            } else {
                $fee->status = 'paid';
            }

            $fee->save();
            
            $enrollment->update([
                'payment_status' => $fee->status === 'paid'
                    ? 'paid'
                    : 'partial',
            ]);

            return response()->json([
                'message' => 'Payment updated successfully',
                'fee' => $fee,
            ]);
        });
    }
}