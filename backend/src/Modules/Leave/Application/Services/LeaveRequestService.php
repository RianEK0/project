<?php

namespace Modules\Leave\Application\Services;

use App\Events\Leave\LeaveRequestSubmitted;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Domain\Contracts\UserRepository;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Leave\Application\DTO\LeaveRequestData;
use Modules\Leave\Domain\Contracts\LeaveRequestRepository;
use Modules\Leave\Domain\Contracts\LeaveTypeRepository;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class LeaveRequestService
{
    public function __construct(
        private readonly LeaveRequestRepository $leaveRequests,
        private readonly LeaveTypeRepository $leaveTypes,
        private readonly UserRepository $users,
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return Collection<int, \Modules\Leave\Infrastructure\Persistence\Models\LeaveType>
     */
    public function leaveTypes(): Collection
    {
        return $this->leaveTypes->active();
    }

    /**
     * @return Collection<int, LeaveRequest>
     */
    public function visibleRequests(User $actor): Collection
    {
        return $this->leaveRequests->visibleTo($actor);
    }

    /**
     * @return Collection<int, LeaveApproval>
     */
    public function approvalInbox(User $actor): Collection
    {
        return $this->leaveRequests->approvalInbox($actor);
    }

    public function create(LeaveRequestData $data, User $actor): LeaveRequest
    {
        /** @var Employee|null $employee */
        $employee = $actor->employee()->with(['manager.user'])->first();

        if (! $employee) {
            throw ValidationException::withMessages([
                'employee' => 'Your account is not linked to an employee profile.',
            ]);
        }

        $startDate = Carbon::parse($data->start_date);
        $endDate = Carbon::parse($data->end_date);

        if ($endDate->lt($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => 'End date must be equal to or after start date.',
            ]);
        }

        $totalDays = (float) $startDate->diffInDays($endDate) + 1;

        return DB::transaction(function () use ($data, $actor, $employee, $totalDays): LeaveRequest {
            $leaveRequest = $this->leaveRequests->create([
                'employee_id' => $employee->id,
                'leave_type_id' => $data->leave_type_id,
                'start_date' => $data->start_date,
                'end_date' => $data->end_date,
                'total_days' => $totalDays,
                'reason' => $data->reason,
                'status' => 'draft',
                'submitted_at' => now(),
                'meta' => $data->meta,
            ]);

            $managerApprover = $employee->manager?->user;
            $hrApprover = User::query()
                ->whereHas('roles', static fn ($query) => $query->where('name', 'hr-manager'))
                ->whereKeyNot($actor->id)
                ->orderBy('id')
                ->first()
                ?? $this->users->administrators()
                    ->reject(static fn (User $user) => $user->id === $actor->id)
                    ->values()
                    ->first();

            $currentApproval = null;

            if ($managerApprover && $managerApprover->id !== $actor->id) {
                $currentApproval = $this->leaveRequests->createApproval([
                    'leave_request_id' => $leaveRequest->id,
                    'approver_id' => $managerApprover->id,
                    'stage' => 'manager',
                    'status' => 'pending',
                ]);

                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'pending_manager',
                ]);

                if ($hrApprover && $hrApprover->id !== $managerApprover->id) {
                    $this->leaveRequests->createApproval([
                        'leave_request_id' => $leaveRequest->id,
                        'approver_id' => $hrApprover->id,
                        'stage' => 'hr',
                        'status' => 'queued',
                    ]);
                }
            } elseif ($hrApprover) {
                $currentApproval = $this->leaveRequests->createApproval([
                    'leave_request_id' => $leaveRequest->id,
                    'approver_id' => $hrApprover->id,
                    'stage' => 'hr',
                    'status' => 'pending',
                ]);

                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'pending_hr',
                ]);
            } else {
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'approved',
                    'reviewer_id' => $actor->id,
                    'reviewed_at' => now(),
                ]);
            }

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.created',
                summary: "Leave request #{$leaveRequest->id} submitted by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            if ($currentApproval) {
                LeaveRequestSubmitted::dispatch($leaveRequest, $currentApproval);
            }

            return $leaveRequest;
        });
    }

    public function approve(LeaveRequest $leaveRequest, User $actor, ?string $remarks = null): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $actor, $remarks): LeaveRequest {
            $approval = $this->leaveRequests->pendingApprovalForUser($leaveRequest, $actor);

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending approval was assigned to this account.',
                ]);
            }

            $this->leaveRequests->updateApproval($approval, [
                'status' => 'approved',
                'acted_at' => now(),
                'remarks' => $remarks,
            ]);

            $nextApproval = $leaveRequest->approvals()
                ->where('status', 'queued')
                ->orderBy('id')
                ->first();

            if ($nextApproval) {
                $this->leaveRequests->updateApproval($nextApproval, [
                    'status' => 'pending',
                ]);

                $status = $nextApproval->stage === 'hr' ? 'pending_hr' : 'pending_manager';
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => $status,
                ]);

                LeaveRequestSubmitted::dispatch($leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType']), $nextApproval->refresh());
            } else {
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'approved',
                    'reviewer_id' => $actor->id,
                    'reviewed_at' => now(),
                ]);
            }

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.approved',
                summary: "Leave request #{$leaveRequest->id} approved by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            return $leaveRequest;
        });
    }

    public function reject(LeaveRequest $leaveRequest, User $actor, string $remarks): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $actor, $remarks): LeaveRequest {
            $approval = $this->leaveRequests->pendingApprovalForUser($leaveRequest, $actor);

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending approval was assigned to this account.',
                ]);
            }

            $this->leaveRequests->updateApproval($approval, [
                'status' => 'rejected',
                'acted_at' => now(),
                'remarks' => $remarks,
            ]);

            $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                'status' => 'rejected',
                'reviewer_id' => $actor->id,
                'reviewed_at' => now(),
                'rejection_reason' => $remarks,
            ]);

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.rejected',
                summary: "Leave request #{$leaveRequest->id} rejected by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            return $leaveRequest;
        });
    }
}
