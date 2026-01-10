<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentDocument;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

class StudentDocumentVerificationController extends Controller
{
    public function verify($documentId)
    {
        $document = StudentDocument::findOrFail($documentId);

        $document->update([
            'verification_status' => 'verified',
            'verified_by' => auth()->id(),
            'verified_at' => now(),
            'remarks' => null,
        ]);

        return response()->json([
            'message' => 'Document verified successfully',
        ]);
    }

    public function reject(Request $request, $documentId)
    {
        $data = $request->validate([
            'remarks' => 'required|string|max:1000',
        ]);

        $document = StudentDocument::findOrFail($documentId);

        $document->update([
            'verification_status' => 'rejected',
            'verified_by' => auth()->id(),
            'verified_at' => now(),
            'remarks' => $data['remarks'],
        ]);

        return response()->json([
            'message' => 'Document rejected successfully',
        ]);
    }
    
    public function adminOverride(Request $request)
    {
        $data = $request->validate([
            'enrollment_id' => [
                'required',
                'exists:student_enrollments,id',
            ],
        ]);
    
        $enrollment = StudentEnrollment::findOrFail(
            $data['enrollment_id']
        );
    
        $document = StudentDocument::where(
                'enrollment_id',
                $enrollment->id
            )
            ->where(
                'document_type',
                'payment_proof'
            )
            ->first();
    
        if (!$document) {
    
            $document = StudentDocument::create([
    
                'student_id' =>
                    $enrollment->student_id,
    
                'enrollment_id' =>
                    $enrollment->id,
    
                'document_type' =>
                    'payment_proof',
    
                'file_path' =>
                    '',
    
                'verification_status' =>
                    'pending',
    
            ]);
    
        }
    
        $document->update([
    
            'verification_status' =>
                'verified',
    
            'verified_by' =>
                auth()->id(),
    
            'verified_at' =>
                now(),
    
            'remarks' =>
                'Verified by admin override. Payment proof upload bypassed.',
    
        ]);
    
        return response()->json([
            'message' =>
                'Payment proof verified successfully.',
        ]);
    }
}