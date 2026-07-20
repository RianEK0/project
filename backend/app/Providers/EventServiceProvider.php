<?php

namespace App\Providers;

use App\Events\Leave\LeaveRequestSubmitted;
use App\Listeners\Leave\QueueLeaveApprovalNotification;
use App\Events\Workforce\EmployeeCreated;
use App\Listeners\Workforce\QueueEmployeeProvisionedNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        EmployeeCreated::class => [
            QueueEmployeeProvisionedNotification::class,
        ],
        LeaveRequestSubmitted::class => [
            QueueLeaveApprovalNotification::class,
        ],
    ];
}
