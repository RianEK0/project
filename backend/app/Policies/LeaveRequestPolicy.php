<?php

namespace App\Policies;

use App\Models\User;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('leave-requests.view');
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->hasPermissionTo('leave-requests.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('leave-requests.create');
    }

    public function approve(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->hasPermissionTo('leave-requests.approve')
            && $leaveRequest->approvals()
                ->where('approver_id', $user->id)
                ->where('status', 'pending')
                ->exists();
    }

    public function reject(User $user, LeaveRequest $leaveRequest): bool
    {
        return $this->approve($user, $leaveRequest);
    }
}
