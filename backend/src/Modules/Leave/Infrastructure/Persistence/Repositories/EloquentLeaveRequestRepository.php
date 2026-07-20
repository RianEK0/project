<?php

namespace Modules\Leave\Infrastructure\Persistence\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;
use Modules\Leave\Domain\Contracts\LeaveRequestRepository;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;

class EloquentLeaveRequestRepository implements LeaveRequestRepository
{
    public function create(array $attributes): LeaveRequest
    {
        return LeaveRequest::query()->create($attributes);
    }

    public function update(LeaveRequest $leaveRequest, array $attributes): LeaveRequest
    {
        $leaveRequest->fill($attributes)->save();

        return $leaveRequest->refresh();
    }

    public function createApproval(array $attributes): LeaveApproval
    {
        return LeaveApproval::query()->create($attributes);
    }

    public function updateApproval(LeaveApproval $approval, array $attributes): LeaveApproval
    {
        $approval->fill($attributes)->save();

        return $approval->refresh();
    }

    public function pendingApprovalForUser(LeaveRequest $leaveRequest, User $user): ?LeaveApproval
    {
        return $leaveRequest->approvals()
            ->where('approver_id', $user->id)
            ->where('status', 'pending')
            ->first();
    }

    public function visibleTo(User $user): Collection
    {
        return LeaveRequest::query()
            ->with(['employee.department', 'employee.team', 'employee.manager.user', 'leaveType', 'reviewer', 'approvals.approver'])
            ->when($user->hasAnyRole(['super-admin', 'hr-manager', 'hr-staff', 'auditor']), function ($query): void {
                $query->latest('submitted_at');
            }, function ($query) use ($user): void {
                if ($user->hasRole('department-manager')) {
                    $query->where(function ($innerQuery) use ($user): void {
                        $innerQuery
                            ->whereHas('employee.user', static fn ($employeeQuery) => $employeeQuery->where('id', $user->id))
                            ->orWhereHas('employee.manager.user', static fn ($managerQuery) => $managerQuery->where('id', $user->id));
                    });

                    return;
                }

                $query->whereHas('employee.user', static fn ($employeeQuery) => $employeeQuery->where('id', $user->id));
            })
            ->latest('submitted_at')
            ->get();
    }

    public function approvalInbox(User $user): Collection
    {
        return LeaveApproval::query()
            ->with(['leaveRequest.employee.department', 'leaveRequest.employee.team', 'leaveRequest.leaveType'])
            ->where('approver_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->get();
    }
}
