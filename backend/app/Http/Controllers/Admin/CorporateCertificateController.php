<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CorporateCertificate;

class CorporateCertificateController extends Controller
{
    public function index()
    {
        return response()->json(
            CorporateCertificate::with('employee')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|integer|exists:corporate_employees,id',
            'certificate_name' => 'required|string|max:255',
            'issued_date' => 'required|date',
            'description' => 'nullable|string|max:2000',
        ]);

        $certificate = CorporateCertificate::create($data);

        return response()->json([
            'message' => 'Certificate issued',
            'data' => $certificate->load('employee')
        ], 201);
    }
}
