<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudyMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\File;

class StudyMaterialController extends Controller
{
    /* ================= LIST ================= */

    public function index()
    {
        return StudyMaterial::with(['creator:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($m) {
                // Files are stored on the private disk — only the streaming
                // endpoint serves them.
                $m->file_url = $m->file_path
                    ? url("/api/admin/study-materials/{$m->id}/view")
                    : null;
                return $m;
            });
    }

    /* ================= STORE ================= */

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:pdf,video,notes',
            'description' => 'nullable|string',
            'notes'       => 'nullable|string',
            'file'        => 'nullable|file|mimes:pdf|max:10240',
            'video_url'   => 'nullable|url',
        ]);

        // Type-specific validation
        if ($data['type'] === 'pdf' && !$request->hasFile('file')) {
            return response()->json(
                ['message' => 'PDF file is required'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($data['type'] === 'video' && empty($data['video_url'])) {
            return response()->json(
                ['message' => 'Video URL is required'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        return DB::transaction(function () use ($data, $request) {

            $filePath = null;

            if ($request->hasFile('file')) {

                $file = $request->file('file');

                $filename =
                    time() . '_' . Str::random(8) . '_' .
                    preg_replace('/[^A-Za-z0-9\.\-_]/', '_', $file->getClientOriginalName());

                $filePath = $file->storeAs(
                    'study-materials',
                    $filename,
                    'private'
                );
            }

            return StudyMaterial::create([
                'title'       => $data['title'],
                'type'        => $data['type'],
                'description' => $data['description'] ?? null,
                'notes'       => $data['notes'] ?? null,
                'video_url'   => $data['video_url'] ?? null,
                'file_path'   => $filePath,
                'status'      => 'active',
                'created_by'  => Auth::id(),
            ]);
        });
    }

    /* ================= UPDATE ================= */

    public function update(Request $request, $id)
    {
        $material = StudyMaterial::findOrFail($id);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'notes'       => 'nullable|string',
            'video_url'   => 'nullable|url',
            'file'        => 'nullable|file|mimes:pdf|max:10240',
        ]);

        DB::transaction(function () use ($material, $request, $data) {

            if ($request->hasFile('file')) {
                if ($material->file_path) {

                    Storage::disk('private')
                        ->delete($material->file_path);
                }

                $file = $request->file('file');

                $filename =
                    time() . '_' . Str::random(8) . '_' .
                    preg_replace('/[^A-Za-z0-9\.\-_]/', '_', $file->getClientOriginalName());

                $material->file_path =
                    $file->storeAs(
                        'study-materials',
                        $filename,
                        'private'
                    );

            }

            unset($data['file']);

            $material->update($data);
        });

        return $material->fresh();
    }

    /* ================= TOGGLE ================= */

    public function toggle($id)
    {
        $material = StudyMaterial::findOrFail($id);

        $material->status =
            $material->status === 'active' ? 'inactive' : 'active';

        $material->save();

        return response()->json([
            'status' => $material->status,
        ]);
    }

    /* ================= DELETE ================= */

    public function destroy($id)
    {
        $material = StudyMaterial::findOrFail($id);

        DB::transaction(function () use ($material) {

            if ($material->file_path) {

                Storage::disk('private')
                    ->delete($material->file_path);
            }

            $material->accessRules()->delete();
            $material->delete();
        });

        return response()->json([
            'message' => 'Study material deleted successfully',
        ]);
    }
    
    public function view($id)
    {
        $material = StudyMaterial::findOrFail($id);
    
        if (!$material->file_path) {
            abort(404);
        }
    
        $path = storage_path(
            'app/private/' . $material->file_path
        );
    
        if (!file_exists($path)) {
            abort(404);
        }
    
        return response()->file($path);
    }
    
    public function studentView($id)
    {
        $student = \App\Models\Student::where(
            'user_id',
            auth()->id()
        )
        ->firstOrFail();

        /*
         | Access is matched against EVERY active/completed enrollment — the
         | single activeEnrollment relation used to 403 students with
         | multiple enrollments and lock out completed students who still
         | see the material in the list.
         */
        $enrollments = $student->enrollments()
            ->whereIn('status', ['active', 'completed'])
            ->get(['course_id', 'batch_id']);

        if ($enrollments->isEmpty()) {
            abort(403);
        }

        $material = StudyMaterial::where('id', $id)
            ->where('status', 'active')
            ->where(function ($q) use ($enrollments) {

                $q->whereHas('accessRules', function ($rule) {
                    $rule->where('access_type', 'all');
                });

                foreach ($enrollments as $enrollment) {

                    $q->orWhereHas('accessRules', function ($rule) use ($enrollment) {

                        $rule->where(function ($courseRule) use ($enrollment) {
                            $courseRule->where('access_type', 'course')
                                ->where('course_id', $enrollment->course_id);
                        });

                        $rule->orWhere(function ($batchRule) use ($enrollment) {
                            $batchRule->where('access_type', 'batch')
                                ->where('course_id', $enrollment->course_id)
                                ->where('batch_id', $enrollment->batch_id);
                        });

                    });

                }
            })
            ->firstOrFail();

        $path = storage_path(
            'app/private/' . $material->file_path
        );

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }

}