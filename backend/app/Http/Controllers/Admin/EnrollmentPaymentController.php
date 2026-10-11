<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\StudentEnrollment;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
                'course',
                'student.user',
            ])->findOrFail($enrollmentId);

            if (in_array($enrollment->status, ['cancelled', 'completed'], true)) {
                return response()->json([
                    'message' => "A {$enrollment->status} enrollment can no longer accept payments.",
                ], 422);
            }

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

            $remaining = (float) $fee->total_fees - (float) $fee->paid_fees;

            if ($data['amount'] > $remaining) {
                return response()->json([
                    'message' => "Amount exceeds the remaining balance ({$remaining}).",
                ], 422);
            }

            $fee->paid_fees += $data['amount'];

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

            /*
             | Mirror the payment into the payments ledger so the revenue
             | dashboard and the student's payment history stay in sync with
             | admin-recorded offline payments.
             */
            $studentUser = $enrollment->student?->user;

            Payment::create([
                'merchant_txn_no' => 'ENR-' . $enrollment->id . '-' . strtolower(Str::random(8)),
                'amount' => $data['amount'],
                'currency' => 'INR',
                'name' => $studentUser?->name,
                'email' => $studentUser?->email,
                'mobile' => $studentUser?->mobile,
                'purpose' => 'course_fee',
                'remarks' => 'Admin-recorded payment for enrollment #' . $enrollment->id
                    . ($enrollment->course?->name ? ' (' . $enrollment->course->name . ')' : ''),
                'payment_mode' => 'offline',
                'status' => 'success',
            ]);

            return response()->json([
                'message' => 'Payment updated successfully',
                'fee' => $fee,
            ]);
        });
    }
}