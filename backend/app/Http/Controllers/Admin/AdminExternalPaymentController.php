<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;

class AdminExternalPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::orderByDesc('created_at');

        // optional filters
        if ($request->filled('email')) {
            $query->where('email', $request->email);
        }

        if ($request->filled('mobile')) {
            $query->where('mobile', $request->mobile);
        }

        $payments = $query->limit(100)->get();

        return response()->json($payments);
    }
}