<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\AuditLogPolicy;
use App\Policies\EmployeePolicy;
use App\Policies\LeaveRequestPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        AuditLog::class => AuditLogPolicy::class,
        Employee::class => EmployeePolicy::class,
        LeaveRequest::class => LeaveRequestPolicy::class,
        Team::class => TeamPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(static function (User $user) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }
}
