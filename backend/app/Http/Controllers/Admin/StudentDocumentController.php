<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentDocumentController extends Controller
{
    private const ALLOWED_DOCUMENTS = [
        'payment_proof',
    ];

    /**
     * Lists every stored document for a student (admin document inbox).
     */
    public function index($studentId)
    {
        $student = Student::findOrFail($studentId);

        $documents = StudentDocument::where('student_id', $student->id)
            ->with('enrollment:id,course_id,batch_id,status')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'sid' => $student->sid,
            ],
            'documents' => $documents,
        ]);
    }

    public function upload(Request $request, $studentId)
    {
        $student = Student::findOrFail($studentId);

        $data = $request->validate([
            'document_type' => [
                'required',
                'in:payment_proof',
            ],
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
            Str::random(8) .
            '_' .
            preg_replace('/[^A-Za-z0-9\.\-_]/', '_', $file->getClientOriginalName());

        Storage::disk('local')->putFileAs(
            'student-documents',
            $file,
            $filename
        );

        $existing = StudentDocument::where('student_id', $student->id)
            ->whereNull('enrollment_id')
            ->where('document_type', $data['document_type'])
            ->first();

        if ($existing) {

            // Replacing the file: drop the old blob so nothing is orphaned.
            if ($existing->file_path) {
                Storage::disk('local')->delete($existing->file_path);
            }

            $existing->update([
                'file_path' => 'student-documents/' . $filename,
                'verification_status' => 'pending',
                'verified_by' => null,
                'verified_at' => null,
                'remarks' => null,
            ]);

            return response()->json([
                'message' => 'Document re-uploaded successfully',
                'document' => $existing->fresh(),
            ]);
        }

        $document = StudentDocument::create([
            'student_id' => $student->id,
            'enrollment_id' => null,
            'document_type' => $data['document_type'],
            'file_path' => 'student-documents/' . $filename,
            'verification_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document,
        ]);
    }
    
    public function view($documentId)
    {
        $document = StudentDocument::findOrFail($documentId);
    
        $user = auth()->user();
    
        if (!$user) {
            abort(403);
        }
    
        if ($user->role !== 'admin') {
            abort(403);
        }
    
        $path = storage_path(
            'app/private/' . $document->file_path
        );
    
        if (!file_exists($path)) {
            abort(404);
        }
    
        return response()->file($path);
    }
    
}