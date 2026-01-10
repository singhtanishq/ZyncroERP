<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CourseCertificateController extends Controller
{
    /**
     * DEPRECATED
     */
    public function index()
    {
        return response()->json([
            'message' => 'This endpoint is deprecated. Use Exam Management → Publish Results.',
        ], 410);
    }

    /**
     * DEPRECATED
     */
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Certificate generation is now exam-based and handled via Exam Management.',
        ], 410);
    }

    /**
     * DEPRECATED
     */
    public function updateExamStatus(Request $request, $id)
    {
        return response()->json([
            'message' => 'Manual exam status updates are deprecated. Use Publish Results.',
        ], 410);
    }
}
