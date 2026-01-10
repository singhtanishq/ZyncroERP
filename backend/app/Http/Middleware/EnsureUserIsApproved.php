<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    /**
     * Block dashboard/module APIs for accounts that have not been approved yet.
     * Administrators are always allowed.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role !== 'admin' && ! $user->approve_status) {
            abort(403, 'Your account is pending approval.');
        }

        return $next($request);
    }
}
