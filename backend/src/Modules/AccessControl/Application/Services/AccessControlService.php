<?php

namespace Modules\AccessControl\Application\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Infrastructure\Persistence\Models\Permission;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Governance\Application\Services\AuditLogService;

class AccessControlService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array{
     *   roles: Collection<int, Role>,
     *   permissions: Collection<int, Permission>,
     *   users: Collection<int, User>
     * }
     */
    public function overview(): array
    {
        return [
            'roles' => Role::query()
                ->with('permissions')
                ->withCount('users')
                ->orderBy('id')
                ->get(),
            'permissions' => Permission::query()
                ->orderBy('group')
                ->orderBy('label')
                ->get(),
            'users' => User::query()
                ->with(['roles', 'employee.department'])
                ->orderBy('name')
                ->get(),
        ];
    }

    public function syncRolePermissions(Role $role, array $permissionIds, User $actor): Role
    {
        if ($role->name === 'super-admin') {
            throw ValidationException::withMessages([
                'role' => 'Permission untuk role Super Admin selalu penuh dan tidak dapat diubah.',
            ]);
        }

        return DB::transaction(function () use ($role, $permissionIds, $actor): Role {
            $role->loadMissing('permissions');

            $oldPermissions = $role->permissions
                ->map(static fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'code' => $permission->code,
                    'label' => $permission->label,
                ])
                ->values()
                ->all();

            $role->permissions()->sync($permissionIds);
            $role = $role->fresh('permissions');

            $newPermissions = $role->permissions
                ->map(static fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'code' => $permission->code,
                    'label' => $permission->label,
                ])
                ->values()
                ->all();

            $this->auditLogs->record(
                actor: $actor,
                auditable: $role,
                action: 'access-control.role-permissions.updated',
                summary: "Permissions updated for role {$role->label}.",
                oldValues: ['permissions' => $oldPermissions],
                newValues: ['permissions' => $newPermissions],
            );

            return $role->loadCount('users');
        });
    }

    public function syncUserRoles(User $user, array $roleIds, User $actor): User
    {
        return DB::transaction(function () use ($user, $roleIds, $actor): User {
            $user->loadMissing('roles');

            $oldRoles = $user->roles
                ->map(static fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                ])
                ->values()
                ->all();

            $selectedRoles = Role::query()
                ->whereIn('id', $roleIds)
                ->get();

            if ($selectedRoles->isEmpty()) {
                throw ValidationException::withMessages([
                    'role_ids' => 'Setidaknya satu role harus dipilih untuk user ini.',
                ]);
            }

            if (
                $user->hasRole('super-admin')
                && ! $selectedRoles->contains('name', 'super-admin')
                && User::query()->whereHas('roles', static fn ($query) => $query->where('name', 'super-admin'))->count() === 1
            ) {
                throw ValidationException::withMessages([
                    'role_ids' => 'Tidak bisa menghapus role Super Admin dari akun terakhir yang memilikinya.',
                ]);
            }

            $user->roles()->sync($selectedRoles->pluck('id')->all());
            $user = $user->fresh(['roles', 'employee.department']);

            $newRoles = $user->roles
                ->map(static fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                ])
                ->values()
                ->all();

            $this->auditLogs->record(
                actor: $actor,
                auditable: $user,
                action: 'access-control.user-roles.updated',
                summary: "Roles updated for user {$user->email}.",
                oldValues: ['roles' => $oldRoles],
                newValues: ['roles' => $newRoles],
            );

            return $user;
        });
    }
}
