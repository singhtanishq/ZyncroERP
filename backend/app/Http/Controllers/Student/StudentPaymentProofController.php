<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentPaymentProofController extends Controller
{
    public function index()
    {
        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        return StudentEnrollment::with([
                'course:id,name',
                'batch:id,name',
                'documents'
            ])
            ->where('student_id', $student->id)
            ->get()
            ->map(function ($enrollment) {

                $document = $enrollment
                    ->documents
                    ->where(
                        'document_type',
                        'payment_proof'
                    )
                    ->first();

                return [
                    'id' => $enrollment->id,

                    'course_name' =>
                        $enrollment->course?->name,

                    'batch_name' =>
                        $enrollment->batch?->name,

                    'document' => $document,
                ];
            });
    }

    public function upload(
        Request $request,
        $enrollmentId
    ) {

        $student = Student::where(
            'user_id',
            auth()->id()
        )->firstOrFail();

        $enrollment = StudentEnrollment::where(
                'student_id',
                $student->id
            )
            ->findOrFail($enrollmentId);

        $existing = StudentDocument::where(
                'enrollment_id',
                $enrollment->id
            )
            ->where(
                'document_type',
                'payment_proof'
            )
            ->first();

        /*
        Block upload when:
        pending
        verified

        Allow only when:
        rejected
        none
        */

        if (
            $existing &&
            in_array(
                $existing->verification_status,
                ['pending', 'verified']
            )
        ) {
            return response()->json([
                'message' =>
                    'Payment proof already submitted.'
            ], 422);
        }

        $data = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],
        ]);

        $file = $request->file('file');

        $filename =
            time() .
            '_' .
            preg_replace(
                '/[^A-Za-z0-9\.\-_]/',
                '_',
                $file->getClientOriginalName()
            );

        Storage::disk('local')
            ->putFileAs(
                'student-documents',
                $file,
                $filename
            );

        if ($existing) {

            $existing->update([
                'file_path' =>
                    'student-documents/' .
                    $filename,

                'verification_status' =>
                    'pending',

                'verified_by' => null,
                'verified_at' => null,
                'remarks' => null,
            ]);

            return response()->json([
                'message' =>
                    'Payment proof re-uploaded.',
            ]);
        }

        StudentDocument::create([
            'student_id' =>
                $student->id,

            'enrollment_id' =>
                $enrollment->id,

            'document_type' =>
                'payment_proof',

            'file_path' =>
                'student-documents/' .
                $filename,

            'verification_status' =>
                'pending',
        ]);

        return response()->json([
            'message' =>
                'Payment proof uploaded.',
        ]);
    }
}