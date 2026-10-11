<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PendingLoginController extends Controller
{
    /**
     * Step 1: Check credentials ONLY (no session created yet)
     * POST /api/login-check
     */
    public function checkCredentials(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        /*
         | Starting a new pending login invalidates any 2FA verification from
         | a previous attempt — otherwise an OTP verified for account A could
         | be replayed to complete a login for account B.
         */
        $request->session()->forget(['two_factor_verified', 'two_factor_verified_user_id']);

        // Save "pending login" info in session (but NOT authenticated)
        $request->session()->put('pending_login_user_id', $user->id);

        return response()->json([
            'message' => 'Credentials valid',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Step 2: After OTP success, create REAL session
     * POST /api/login-complete
     */
    public function completeLogin(Request $request)
    {
        $pendingId = $request->session()->get('pending_login_user_id');

        if (! $pendingId) {
            return response()->json(['message' => 'No pending login found'], 401);
        }

        /*
         | The OTP step must have been completed for THIS pending login.
         | The flags are pulled (read + cleared) so a verification can never
         | be replayed for a second login or borrowed across accounts.
         */
        $verified = $request->session()->pull('two_factor_verified', false);
        $verifiedUserId = $request->session()->pull('two_factor_verified_user_id');

        if (! $verified || (int) $verifiedUserId !== (int) $pendingId) {
            return response()->json(['message' => 'OTP verification required'], 401);
        }

        $user = User::find($pendingId);

        if (! $user) {
            return response()->json(['message' => 'User no longer exists'], 404);
        }

        // Clear pending
        $request->session()->forget('pending_login_user_id');

        // Create REAL login session (regenerate the id to prevent fixation)
        $request->session()->regenerate();
        auth()->login($user);

        return response()->json([
            'message' => 'Login completed',
            'user' => $user,
        ]);
    }

    /**
     * Utility endpoint: Clear pending login manually
     * POST /api/login-cancel
     */
    public function cancelPendingLogin(Request $request)
    {
        $request->session()->forget([
            'pending_login_user_id',
            'two_factor_verified',
            'two_factor_verified_user_id',
        ]);
        return response()->json(['message' => 'Pending login canceled']);
    }
}
