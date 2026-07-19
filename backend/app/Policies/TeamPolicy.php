<?php

namespace App\Policies;

use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('organization.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('teams.manage');
    }
}
