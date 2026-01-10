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

        return $franchise;
    }
}
