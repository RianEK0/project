<?php

namespace App\Events\Leave;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;

class LeaveRequestSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly LeaveRequest $leaveRequest,
        public readonly LeaveApproval $approval,
    ) {
    }
}
