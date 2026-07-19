<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\AccessControl\Domain\Contracts\UserRepository;
use Modules\AccessControl\Infrastructure\Persistence\Repositories\EloquentUserRepository;
use Modules\Governance\Domain\Contracts\AuditLogRepository;
use Modules\Governance\Infrastructure\Persistence\Repositories\EloquentAuditLogRepository;
use Modules\Leave\Domain\Contracts\LeaveRequestRepository;
use Modules\Leave\Domain\Contracts\LeaveTypeRepository;
use Modules\Leave\Infrastructure\Persistence\Repositories\EloquentLeaveRequestRepository;
use Modules\Leave\Infrastructure\Persistence\Repositories\EloquentLeaveTypeRepository;
use Modules\Organization\Domain\Contracts\TeamRepository;
use Modules\Organization\Infrastructure\Persistence\Repositories\EloquentTeamRepository;
use Modules\Workforce\Domain\Contracts\DepartmentRepository;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;
use Modules\Workforce\Infrastructure\Persistence\Repositories\EloquentDepartmentRepository;
use Modules\Workforce\Infrastructure\Persistence\Repositories\EloquentEmployeeRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepository::class, EloquentUserRepository::class);
        $this->app->bind(AuditLogRepository::class, EloquentAuditLogRepository::class);
        $this->app->bind(LeaveRequestRepository::class, EloquentLeaveRequestRepository::class);
        $this->app->bind(LeaveTypeRepository::class, EloquentLeaveTypeRepository::class);
        $this->app->bind(TeamRepository::class, EloquentTeamRepository::class);
        $this->app->bind(DepartmentRepository::class, EloquentDepartmentRepository::class);
        $this->app->bind(EmployeeRepository::class, EloquentEmployeeRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
