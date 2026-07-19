<?php

use App\Http\Controllers\Api\V1\Governance\AuditLogController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Dashboard\DashboardController;
use App\Http\Controllers\Api\V1\Leave\ApprovalInboxController;
use App\Http\Controllers\Api\V1\Leave\LeaveApprovalController;
use App\Http\Controllers\Api\V1\Leave\LeaveRequestController;
use App\Http\Controllers\Api\V1\Leave\LeaveTypeController;
use App\Http\Controllers\Api\V1\Organization\OrganizationStructureController;
use App\Http\Controllers\Api\V1\Organization\TeamController;
use App\Http\Controllers\Api\V1\Workforce\DepartmentController;
use App\Http\Controllers\Api\V1\Workforce\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:api')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
        });

        Route::get('dashboard', DashboardController::class)->middleware('permission:dashboard.view');
        Route::get('departments', [DepartmentController::class, 'index'])->middleware('permission:employees.view');
        Route::get('organization/structure', OrganizationStructureController::class)->middleware('permission:organization.view');
        Route::apiResource('teams', TeamController::class)->only(['index', 'store']);
        Route::get('leave-types', [LeaveTypeController::class, 'index'])->middleware('permission:leave-requests.view');
        Route::get('leave-requests', [LeaveRequestController::class, 'index'])->middleware('permission:leave-requests.view');
        Route::post('leave-requests', [LeaveRequestController::class, 'store'])->middleware('permission:leave-requests.create');
        Route::get('approvals/inbox', ApprovalInboxController::class)->middleware('permission:leave-requests.approve');
        Route::post('leave-requests/{leaveRequest}/approve', [LeaveApprovalController::class, 'approve'])->middleware('permission:leave-requests.approve');
        Route::post('leave-requests/{leaveRequest}/reject', [LeaveApprovalController::class, 'reject'])->middleware('permission:leave-requests.approve');
        Route::get('audit-logs', AuditLogController::class)->middleware('permission:audit.view');
        Route::apiResource('employees', EmployeeController::class);
    });
});
