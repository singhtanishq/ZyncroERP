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
        $certificate = CorporateCertificate::create($request->all());

        return response()->json([
            'message' => 'Certificate issued',
            'data' => $certificate
        ]);
    }
}