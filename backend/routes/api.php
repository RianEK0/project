<?php

use App\Http\Controllers\Api\V1\AccessControl\AccessControlController;
use App\Http\Controllers\Api\V1\Assets\ItAssetController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceCorrectionController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceHolidayController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceShiftController;
use App\Http\Controllers\Api\V1\Governance\AuditLogController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Dashboard\DashboardController;
use App\Http\Controllers\Api\V1\Leave\ApprovalInboxController;
use App\Http\Controllers\Api\V1\Leave\LeaveApprovalController;
use App\Http\Controllers\Api\V1\Leave\LeaveRequestController;
use App\Http\Controllers\Api\V1\Leave\LeaveTypeController;
use App\Http\Controllers\Api\V1\Leave\LeaveWorkspaceController;
use App\Http\Controllers\Api\V1\Notifications\NotificationCenterController;
use App\Http\Controllers\Api\V1\Organization\OrganizationStructureController;
use App\Http\Controllers\Api\V1\Organization\TeamController;
use App\Http\Controllers\Api\V1\Payroll\PayrollController;
use App\Http\Controllers\Api\V1\Performance\PerformanceController;
use App\Http\Controllers\Api\V1\Recruitment\RecruitmentController;
use App\Http\Controllers\Api\V1\Workforce\DepartmentController;
use App\Http\Controllers\Api\V1\Workforce\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('captcha', [AuthController::class, 'captcha'])->middleware('throttle:auth-captcha');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
        Route::post('login/2fa', [AuthController::class, 'verifyTwoFactorLogin'])->middleware('throttle:auth-two-factor');
        Route::post('refresh', [AuthController::class, 'refresh'])->middleware('throttle:auth-refresh');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth-forgot-password');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth-reset-password');
        Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed', 'throttle:auth-email-verification'])
            ->name('verification.verify');
    });

    Route::middleware(['auth:api', 'active-session'])->group(function () {
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('email/verification-notification', [AuthController::class, 'sendVerificationNotification'])->middleware('throttle:auth-email-verification');
            Route::get('sessions', [AuthController::class, 'sessions'])->middleware('throttle:auth-session-management');
            Route::delete('sessions/others', [AuthController::class, 'revokeOtherSessions'])->middleware('throttle:auth-session-management');
            Route::delete('sessions/{sessionId}', [AuthController::class, 'revokeSession'])->middleware('throttle:auth-session-management');
            Route::get('login-history', [AuthController::class, 'loginHistory'])->middleware('throttle:auth-session-management');
            Route::post('two-factor/setup', [AuthController::class, 'beginTwoFactorSetup'])->middleware('throttle:auth-two-factor-management');
            Route::post('two-factor/confirm', [AuthController::class, 'confirmTwoFactorSetup'])->middleware('throttle:auth-two-factor-management');
            Route::delete('two-factor', [AuthController::class, 'disableTwoFactor'])->middleware('throttle:auth-two-factor-management');
            Route::post('change-password', [AuthController::class, 'changePassword'])->middleware('throttle:auth-change-password');
        });

        Route::get('dashboard', DashboardController::class)->middleware('permission:dashboard.view');
        Route::get('departments', [DepartmentController::class, 'index'])->middleware('permission:employees.view');
        Route::get('organization/structure', [OrganizationStructureController::class, 'index'])->middleware('permission:organization.view');
        Route::get('organization/lookups', [OrganizationStructureController::class, 'lookups'])->middleware('permission:organization.view');
        Route::post('organization/units', [OrganizationStructureController::class, 'storeUnit'])->middleware('permission:teams.manage');
        Route::get('teams', [TeamController::class, 'index'])->middleware('permission:organization.view');
        Route::post('teams', [TeamController::class, 'store'])->middleware('permission:teams.manage');
        Route::get('access-control', [AccessControlController::class, 'index'])->middleware('permission:roles.manage,users.manage');
        Route::put('access-control/roles/{role}/permissions', [AccessControlController::class, 'syncRolePermissions'])->middleware(['role:super-admin', 'permission:roles.manage']);
        Route::put('access-control/users/{user}/roles', [AccessControlController::class, 'syncUserRoles'])->middleware('permission:users.manage');
        Route::get('leave-types', [LeaveTypeController::class, 'index'])->middleware('permission:leave-requests.view');
        Route::get('leave-overview', [LeaveWorkspaceController::class, 'overview'])->middleware('permission:leave-requests.view');
        Route::get('leave-calendar', [LeaveWorkspaceController::class, 'calendar'])->middleware('permission:leave-requests.view');
        Route::get('leave-requests', [LeaveRequestController::class, 'index'])->middleware('permission:leave-requests.view');
        Route::post('leave-requests', [LeaveRequestController::class, 'store'])->middleware('permission:leave-requests.create');
        Route::get('approvals/inbox', ApprovalInboxController::class)->middleware('permission:leave-requests.approve');
        Route::post('leave-requests/{leaveRequest}/approve', [LeaveApprovalController::class, 'approve'])->middleware('permission:leave-requests.approve');
        Route::post('leave-requests/{leaveRequest}/reject', [LeaveApprovalController::class, 'reject'])->middleware('permission:leave-requests.approve');
        Route::get('audit-logs', AuditLogController::class)->middleware('permission:audit.view');
        Route::prefix('recruitment')->group(function () {
            Route::get('overview', [RecruitmentController::class, 'overview'])->middleware('permission:recruitment.view');
            Route::get('lookups', [RecruitmentController::class, 'lookups'])->middleware('permission:recruitment.view');
            Route::get('vacancies', [RecruitmentController::class, 'vacancies'])->middleware('permission:recruitment.view');
            Route::post('vacancies', [RecruitmentController::class, 'storeVacancy'])->middleware('permission:recruitment.manage');
            Route::get('candidates', [RecruitmentController::class, 'candidates'])->middleware('permission:recruitment.view');
            Route::post('candidates', [RecruitmentController::class, 'storeCandidate'])->middleware('permission:recruitment.manage');
            Route::post('candidates/{candidate}/update', [RecruitmentController::class, 'updateCandidate'])->middleware('permission:recruitment.manage');
            Route::match(['put', 'patch'], 'candidates/{candidate}', [RecruitmentController::class, 'updateCandidate'])->middleware('permission:recruitment.manage');
            Route::get('applications', [RecruitmentController::class, 'applications'])->middleware('permission:recruitment.view');
            Route::get('applications/{application}', [RecruitmentController::class, 'showApplication'])->middleware('permission:recruitment.view');
            Route::post('applications/{application}/update', [RecruitmentController::class, 'updateApplication'])->middleware('permission:recruitment.manage');
            Route::match(['put', 'patch'], 'applications/{application}', [RecruitmentController::class, 'updateApplication'])->middleware('permission:recruitment.manage');
            Route::get('interviews/schedule', [RecruitmentController::class, 'interviewSchedule'])->middleware('permission:recruitment.view');
            Route::post('applications/{application}/interviews', [RecruitmentController::class, 'scheduleInterview'])->middleware('permission:recruitment.manage');
            Route::post('applications/{application}/assessments', [RecruitmentController::class, 'recordAssessment'])->middleware('permission:recruitment.manage');
            Route::post('applications/{application}/hire', [RecruitmentController::class, 'hire'])->middleware('permission:recruitment.manage');
        });
        Route::prefix('performance')->group(function () {
            Route::get('overview', [PerformanceController::class, 'overview'])->middleware('permission:performance.view');
            Route::get('lookups', [PerformanceController::class, 'lookups'])->middleware('permission:performance.view');
            Route::get('cycles', [PerformanceController::class, 'cycles'])->middleware('permission:performance.view');
            Route::post('cycles', [PerformanceController::class, 'storeCycle'])->middleware('permission:performance.manage');
            Route::get('goals', [PerformanceController::class, 'goals'])->middleware('permission:performance.view');
            Route::post('goals', [PerformanceController::class, 'storeGoal'])->middleware('permission:performance.manage');
            Route::post('goals/{goal}/update', [PerformanceController::class, 'updateGoal'])->middleware('permission:performance.review');
            Route::match(['put', 'patch'], 'goals/{goal}', [PerformanceController::class, 'updateGoal'])->middleware('permission:performance.review');
            Route::get('reviews', [PerformanceController::class, 'reviews'])->middleware('permission:performance.view');
            Route::get('reviews/{review}', [PerformanceController::class, 'showReview'])->middleware('permission:performance.view');
            Route::post('reviews', [PerformanceController::class, 'storeReview'])->middleware('permission:performance.manage');
            Route::post('reviews/{review}/employee-review', [PerformanceController::class, 'submitEmployeeReview'])->middleware('permission:performance.review');
            Route::post('reviews/{review}/manager-review', [PerformanceController::class, 'submitManagerReview'])->middleware('permission:performance.review');
            Route::post('reviews/{review}/feedback', [PerformanceController::class, 'recordFeedback'])->middleware('permission:performance.review');
        });
        Route::prefix('assets')->group(function () {
            Route::get('overview', [ItAssetController::class, 'overview'])->middleware('permission:assets.view');
            Route::get('lookups', [ItAssetController::class, 'lookups'])->middleware('permission:assets.view');
            Route::get('', [ItAssetController::class, 'index'])->middleware('permission:assets.view');
            Route::post('', [ItAssetController::class, 'store'])->middleware('permission:assets.manage');
            Route::get('{asset}', [ItAssetController::class, 'show'])->middleware('permission:assets.view');
            Route::post('{asset}/assignments', [ItAssetController::class, 'assign'])->middleware('permission:assets.manage');
            Route::post('assignments/{assignment}/return', [ItAssetController::class, 'return'])->middleware('permission:assets.manage');
            Route::post('{asset}/maintenance', [ItAssetController::class, 'storeMaintenance'])->middleware('permission:assets.manage');
        });
        Route::prefix('notifications')->group(function () {
            Route::get('overview', [NotificationCenterController::class, 'overview'])->middleware('permission:notifications.view');
            Route::get('lookups', [NotificationCenterController::class, 'lookups'])->middleware('permission:notifications.view');
            Route::get('inbox', [NotificationCenterController::class, 'inbox'])->middleware('permission:notifications.view');
            Route::post('inbox/read-all', [NotificationCenterController::class, 'markAllRead'])->middleware('permission:notifications.view');
            Route::post('inbox/{notification}/read', [NotificationCenterController::class, 'markRead'])->middleware('permission:notifications.view');
            Route::get('deliveries', [NotificationCenterController::class, 'deliveries'])->middleware('permission:notifications.view');
            Route::put('channels/{channelConfig}', [NotificationCenterController::class, 'updateChannel'])->middleware('permission:notifications.manage');
            Route::post('broadcast', [NotificationCenterController::class, 'broadcast'])->middleware('permission:notifications.manage');
        });
        Route::prefix('payroll')->group(function () {
            Route::get('overview', [PayrollController::class, 'overview'])->middleware('permission:payroll.view');
            Route::get('lookups', [PayrollController::class, 'lookups'])->middleware('permission:payroll.view');
            Route::get('runs', [PayrollController::class, 'index'])->middleware('permission:payroll.view');
            Route::post('runs', [PayrollController::class, 'store'])->middleware('permission:payroll.manage');
            Route::get('runs/{payrollRun}', [PayrollController::class, 'show'])->middleware('permission:payroll.view');
            Route::post('runs/{payrollRun}/approve', [PayrollController::class, 'approve'])->middleware('permission:payroll.manage');
            Route::post('runs/{payrollRun}/reject', [PayrollController::class, 'reject'])->middleware('permission:payroll.manage');
            Route::get('runs/{payrollRun}/export/pdf', [PayrollController::class, 'downloadRunPdf'])->middleware('permission:payroll.view');
            Route::get('runs/{payrollRun}/export/excel', [PayrollController::class, 'downloadRunExcel'])->middleware('permission:payroll.view');
            Route::get('approvals', [PayrollController::class, 'approvalInbox'])->middleware('permission:payroll.view');
            Route::get('payslips', [PayrollController::class, 'payslips'])->middleware('permission:payroll.view');
            Route::put('items/{payrollItem}', [PayrollController::class, 'updateItem'])->middleware('permission:payroll.manage');
            Route::get('payslips/{payrollItem}/pdf', [PayrollController::class, 'downloadPayslip'])->middleware('permission:payroll.view');
        });
        Route::prefix('attendance')->group(function () {
            Route::get('overview', [AttendanceController::class, 'overview'])->middleware('permission:attendance.view');
            Route::get('lookups', [AttendanceController::class, 'lookups'])->middleware('permission:attendance.view');
            Route::get('', [AttendanceController::class, 'index'])->middleware('permission:attendance.view');
            Route::get('report', [AttendanceController::class, 'report'])->middleware('permission:attendance.view');
            Route::post('clock-in', [AttendanceController::class, 'clockIn'])->middleware('permission:attendance.clock');
            Route::post('clock-out', [AttendanceController::class, 'clockOut'])->middleware('permission:attendance.clock');
            Route::post('manual', [AttendanceController::class, 'manual'])->middleware('permission:attendance.manual');
            Route::get('corrections', [AttendanceCorrectionController::class, 'index'])->middleware('permission:attendance.view');
            Route::post('corrections', [AttendanceCorrectionController::class, 'store'])->middleware('permission:attendance.corrections.create');
            Route::get('approvals', [AttendanceCorrectionController::class, 'approvals'])->middleware('permission:attendance.approve');
            Route::post('corrections/{correction}/approve', [AttendanceCorrectionController::class, 'approve'])->middleware('permission:attendance.approve');
            Route::post('corrections/{correction}/reject', [AttendanceCorrectionController::class, 'reject'])->middleware('permission:attendance.approve');
            Route::get('shifts', [AttendanceShiftController::class, 'index'])->middleware('permission:attendance.view');
            Route::post('shifts', [AttendanceShiftController::class, 'store'])->middleware('permission:attendance.manage');
            Route::post('shift-assignments', [AttendanceShiftController::class, 'assign'])->middleware('permission:attendance.manage');
            Route::get('holidays', [AttendanceHolidayController::class, 'index'])->middleware('permission:attendance.view');
            Route::post('holidays', [AttendanceHolidayController::class, 'store'])->middleware('permission:attendance.manage');
        });
        Route::get('employees/lookups', [EmployeeController::class, 'lookups'])->middleware('permission:employees.view');
        Route::get('employees/{employee}/audit-logs', [EmployeeController::class, 'auditLogs'])->middleware('permission:employees.view');
        Route::post('employees/{employee}/documents', [EmployeeController::class, 'uploadDocument'])->middleware('permission:employees.update');
        Route::delete('employees/{employee}/documents/{document}', [EmployeeController::class, 'destroyDocument'])->middleware('permission:employees.update');
        Route::get('employees', [EmployeeController::class, 'index'])->middleware('permission:employees.view');
        Route::post('employees', [EmployeeController::class, 'store'])->middleware('permission:employees.create');
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->middleware('permission:employees.view');
        Route::match(['put', 'patch'], 'employees/{employee}', [EmployeeController::class, 'update'])->middleware('permission:employees.update');
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->middleware('permission:employees.delete');
    });
});
