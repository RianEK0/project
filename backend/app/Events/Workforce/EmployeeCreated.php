<?php

namespace App\Events\Workforce;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class EmployeeCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Employee $employee,
        public readonly User $actor,
    ) {
    }
}
