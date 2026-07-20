<?php

namespace App\Models;

use App\Notifications\Auth\ResetPasswordNotification;
use App\Notifications\Auth\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmailContract
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, MustVerifyEmail, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'last_login_at',
        'failed_login_attempts',
        'last_failed_login_at',
        'locked_until',
        'password_changed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'last_failed_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'password_changed_at' => 'datetime',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class, 'reviewer_id');
    }

    public function authSessions(): HasMany
    {
        return $this->hasMany(AuthSession::class);
    }

    public function loginHistories(): HasMany
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function passwordHistories(): HasMany
    {
        return $this->hasMany(PasswordHistory::class);
    }

    public function pendingApprovals(): HasMany
    {
        return $this->hasMany(LeaveApproval::class, 'approver_id');
    }

    public function hasTwoFactorEnabled(): bool
    {
        return filled($this->two_factor_secret) && $this->two_factor_confirmed_at !== null;
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function hasRole(string $role): bool
    {
        $this->loadMissing('roles');

        return $this->roles->contains('name', $role);
    }

    /**
     * @param  list<string>  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        $this->loadMissing('roles');

        return $this->roles->pluck('name')->intersect($roles)->isNotEmpty();
    }

    public function resolvedPermissions(): Collection
    {
        $this->loadMissing('roles.permissions');

        return $this->roles
            ->flatMap(static fn (Role $role) => $role->permissions)
            ->unique('code')
            ->values();
    }

    public function hasPermissionTo(string $permission): bool
    {
        return $this->resolvedPermissions()->contains('code', $permission);
    }

    /**
     * @param  list<string>  $permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        return $this->resolvedPermissions()->pluck('code')->intersect($permissions)->isNotEmpty();
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
