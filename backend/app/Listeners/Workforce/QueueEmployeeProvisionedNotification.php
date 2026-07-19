<?php

namespace App\Listeners\Workforce;

use App\Events\Workforce\EmployeeCreated;
use App\Notifications\Workforce\EmployeeProvisionedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Modules\AccessControl\Domain\Contracts\UserRepository;

class QueueEmployeeProvisionedNotification implements ShouldQueue
{
    public function __construct(
        private readonly UserRepository $users,
    ) {
    }

    public function handle(EmployeeCreated $event): void
    {
        $administrators = $this->users->administrators();

        if ($administrators->isEmpty()) {
            return;
        }

        Notification::send($administrators, new EmployeeProvisionedNotification(
            employee: $event->employee,
            actor: $event->actor,
        ));
    }
}
