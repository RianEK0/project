<?php

namespace App\Providers;

use App\Services\ModelChangeAuditService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
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
        $this->configureRateLimiters();

        if (config('security.force_https', app()->environment('production'))) {
            URL::forceScheme('https');
        }

        Event::listen('eloquent.created: *', function (string $event, array $data): void {
            $model = $data[0] ?? null;

            if ($model instanceof Model) {
                app(ModelChangeAuditService::class)->recordCreated($model);
            }
        });

        Event::listen('eloquent.updated: *', function (string $event, array $data): void {
            $model = $data[0] ?? null;

            if ($model instanceof Model) {
                app(ModelChangeAuditService::class)->recordUpdated($model);
            }
        });

        Event::listen('eloquent.deleted: *', function (string $event, array $data): void {
            $model = $data[0] ?? null;

            if ($model instanceof Model) {
                app(ModelChangeAuditService::class)->recordDeleted($model);
            }
        });
    }

    private function configureRateLimiters(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.api.per_minute', 120))
                ->by($this->resolveRequestSignature($request));
        });

        RateLimiter::for('auth-captcha', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.auth.captcha_per_minute', 30))
                ->by($request->ip());
        });

        RateLimiter::for('auth-login', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.auth.login_per_minute', 5))
                ->by($this->hashValue(strtolower((string) $request->input('email')).'|'.$request->ip()));
        });

        RateLimiter::for('auth-two-factor', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.auth.two_factor_per_minute', 6))
                ->by($this->hashValue((string) $request->input('challenge_id').'|'.$request->ip()));
        });

        RateLimiter::for('auth-refresh', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.auth.refresh_per_minute', 20))
                ->by($this->hashValue($request->ip().'|'.$request->userAgent()));
        });

        RateLimiter::for('auth-forgot-password', function (Request $request): Limit {
            return Limit::perHour((int) config('security.rate_limits.auth.forgot_password_per_hour', 5))
                ->by($this->hashValue(strtolower((string) $request->input('email')).'|'.$request->ip()));
        });

        RateLimiter::for('auth-reset-password', function (Request $request): Limit {
            return Limit::perHour((int) config('security.rate_limits.auth.reset_password_per_hour', 10))
                ->by($this->hashValue(
                    strtolower((string) $request->input('email'))
                    .'|'.(string) $request->input('token')
                    .'|'.$request->ip()
                ));
        });

        RateLimiter::for('auth-email-verification', function (Request $request): Limit {
            return Limit::perHour((int) config('security.rate_limits.auth.email_verification_per_hour', 6))
                ->by($this->hashValue(
                    (string) optional($request->user('api'))->getAuthIdentifier()
                    .'|'.$request->ip()
                ));
        });

        RateLimiter::for('auth-session-management', function (Request $request): Limit {
            return Limit::perMinute((int) config('security.rate_limits.auth.session_management_per_minute', 20))
                ->by($this->hashValue(
                    (string) optional($request->user('api'))->getAuthIdentifier()
                    .'|'.$request->ip()
                ));
        });

        RateLimiter::for('auth-two-factor-management', function (Request $request): Limit {
            return Limit::perHour((int) config('security.rate_limits.auth.two_factor_management_per_hour', 10))
                ->by($this->hashValue(
                    (string) optional($request->user('api'))->getAuthIdentifier()
                    .'|'.$request->ip()
                ));
        });

        RateLimiter::for('auth-change-password', function (Request $request): Limit {
            return Limit::perHour((int) config('security.rate_limits.auth.change_password_per_hour', 8))
                ->by($this->hashValue(
                    (string) optional($request->user('api'))->getAuthIdentifier()
                    .'|'.$request->ip()
                ));
        });
    }

    private function resolveRequestSignature(Request $request): string
    {
        $userId = optional($request->user('api'))->getAuthIdentifier();

        return $this->hashValue(($userId ? 'user:'.$userId : 'ip:'.$request->ip()).'|'.$request->userAgent());
    }

    private function hashValue(string $value): string
    {
        return hash('sha256', $value);
    }
}
