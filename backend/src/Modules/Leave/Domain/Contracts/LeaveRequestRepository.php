<?php

namespace Modules\Leave\Domain\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;

interface LeaveRequestRepository
{
    public function create(array $attributes): LeaveRequest;

    public function update(LeaveRequest $leaveRequest, array $attributes): LeaveRequest;

    public function createApproval(array $attributes): LeaveApproval;

    public function updateApproval(LeaveApproval $approval, array $attributes): LeaveApproval;

    public function pendingApprovalForUser(LeaveRequest $leaveRequest, User $user): ?LeaveApproval;

    /**
     * @return Collection<int, LeaveRequest>
     */
    public function visibleTo(User $user): Collection;

    /**
     * @return Collection<int, LeaveApproval>
     */
    public function approvalInbox(User $user): Collection;
}
