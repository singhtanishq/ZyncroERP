<?php

namespace App\Http\Controllers\Franchise\Concerns;

use App\Models\Franchise;

trait ResolvesFranchise
{
    /**
     * The franchise owned by the authenticated franchise user.
     */
    protected function franchise(): Franchise
    {
        $franchise = Franchise::where('user_id', auth()->id())->first();

        abort_unless($franchise, 403, 'No franchise profile is linked to this account.');

        // A deactivated franchise must not keep reading its dashboard data.
        abort_unless($franchise->status === 'active', 403, 'This franchise account is currently deactivated.');

        return $franchise;
    }
}
