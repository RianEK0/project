<?php

namespace App\Listeners\Leave;

use App\Events\Leave\LeaveRequestSubmitted;
use App\Notifications\Leave\LeaveApprovalRequiredNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class QueueLeaveApprovalNotification implements ShouldQueue
{
    public function handle(LeaveRequestSubmitted $event): void
    {
        $approval = $event->approval->loadMissing('approver');
        $approver = $approval->approver;

        if (! $approver) {
            return;
        }

        $approver->notify(new LeaveApprovalRequiredNotification(
            leaveRequest: $event->leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType']),
            approval: $approval,
        ));
    }
}
