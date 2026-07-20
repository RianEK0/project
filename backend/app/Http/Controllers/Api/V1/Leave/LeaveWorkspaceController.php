<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveBalanceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Leave\Application\Services\LeaveRequestService;
use Shared\Application\Support\ApiResponse;

class LeaveWorkspaceController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->leaveRequests->overview(
            actor: $request->user('api'),
            employeeId: $request->integer('employee_id') ?: null,
        );

        return ApiResponse::success([
            'date' => $overview['date'],
            'employee' => $overview['employee'] ? [
                'id' => $overview['employee']->id,
                'employee_number' => $overview['employee']->employee_number,
                'full_name' => $overview['employee']->full_name,
                'department' => $overview['employee']->department?->name,
            ] : null,
            'balances' => LeaveBalanceResource::collection($overview['balances'])->resolve(),
            'holidays' => collect($overview['holidays'])->map(static fn ($holiday): array => [
                'id' => $holiday->id,
                'name' => $holiday->name,
                'holiday_date' => $holiday->holiday_date?->toDateString(),
                'type' => $holiday->type,
                'notes' => $holiday->notes,
            ])->values()->all(),
            'reminders' => $overview['reminders'],
            'stats' => $overview['stats'],
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $calendar = $this->leaveRequests->calendar(
            actor: $request->user('api'),
            month: $validated['month'] ?? now()->format('Y-m'),
            employeeId: isset($validated['employee_id']) ? (int) $validated['employee_id'] : null,
        );

        return ApiResponse::success($calendar);
    }
}
