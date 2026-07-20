<?php

namespace App\Http\Controllers\Api\V1\AccessControl;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccessControl\SyncRolePermissionsRequest;
use App\Http\Requests\AccessControl\SyncUserRolesRequest;
use App\Http\Resources\AccessControl\AccessControlUserResource;
use App\Http\Resources\AccessControl\PermissionResource;
use App\Http\Resources\AccessControl\RoleResource;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AccessControl\Application\Services\AccessControlService;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Shared\Application\Support\ApiResponse;

class AccessControlController extends Controller
{
    public function __construct(
        private readonly AccessControlService $accessControl,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $this->authorizeAnyAccessControlPermission($request->user('api'));
        $overview = $this->accessControl->overview();

        return ApiResponse::success([
            'can_manage_roles' => $user->hasPermissionTo('roles.manage'),
            'can_manage_users' => $user->hasPermissionTo('users.manage'),
            'roles' => RoleResource::collection($overview['roles']),
            'permissions' => PermissionResource::collection($overview['permissions']),
            'users' => AccessControlUserResource::collection($overview['users']),
        ]);
    }

    public function syncRolePermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $updatedRole = $this->accessControl->syncRolePermissions(
            $role,
            $request->validated('permission_ids'),
            $request->user('api'),
        );

        return ApiResponse::success(
            new RoleResource($updatedRole->loadMissing('permissions')),
            'Role permissions updated successfully.',
        );
    }

    public function syncUserRoles(SyncUserRolesRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->accessControl->syncUserRoles(
            $user,
            $request->validated('role_ids'),
            $request->user('api'),
        );

        return ApiResponse::success(
            new AccessControlUserResource($updatedUser->loadMissing('roles', 'employee.department')),
            'User roles updated successfully.',
        );
    }

    /**
     * @throws AuthorizationException
     */
    private function authorizeAnyAccessControlPermission(?User $user): User
    {
        if (! $user || ! ($user->hasPermissionTo('roles.manage') || $user->hasPermissionTo('users.manage'))) {
            throw new AuthorizationException('You do not have permission to access access control management.');
        }

        return $user;
    }
}
