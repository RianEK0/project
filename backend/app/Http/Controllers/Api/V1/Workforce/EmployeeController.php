<?php

namespace App\Http\Controllers\Api\V1\Workforce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workforce\StoreEmployeeDocumentRequest;
use App\Http\Resources\Governance\AuditLogResource;
use App\Http\Requests\Workforce\StoreEmployeeRequest;
use App\Http\Requests\Workforce\UpdateEmployeeRequest;
use App\Http\Resources\Workforce\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Workforce\Application\DTO\EmployeeData;
use Modules\Workforce\Application\Services\EmployeeService;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeDocument;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['department_id', 'branch_id', 'employment_status', 'employment_type', 'manager_id'],
            allowedSorts: ['default', 'employee_number', 'full_name', 'hire_date', 'employment_status', 'created_at'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $employees = $this->employeeService->paginate($query);

        return ApiResponse::paginated(
            $employees,
            EmployeeResource::collection($employees->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);

        $employee = $this->employeeService->create(
            EmployeeData::fromArray($request->validated()),
            $request->user('api'),
        );

        return ApiResponse::success(
            new EmployeeResource($employee),
            'Employee created successfully.',
            201,
        );
    }

    public function show(Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        return ApiResponse::success(new EmployeeResource($this->employeeService->show($employee)));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $employee = $this->employeeService->update(
            $employee,
            EmployeeData::fromArray($request->validated()),
            $request->user('api'),
        );

        return ApiResponse::success(
            new EmployeeResource($employee),
            'Employee updated successfully.',
        );
    }

    public function destroy(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('delete', $employee);

        $this->employeeService->delete($employee, $request->user('api'));

        return ApiResponse::success(null, 'Employee archived successfully.');
    }

    public function lookups(): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        return ApiResponse::success($this->employeeService->lookups());
    }

    public function uploadDocument(StoreEmployeeDocumentRequest $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $employee = $this->employeeService->uploadDocument(
            $employee,
            $request->file('file'),
            $request->validated(),
            $request->user('api'),
        );

        return ApiResponse::success(
            new EmployeeResource($employee),
            'Employee document uploaded successfully.',
            201,
        );
    }

    public function destroyDocument(Request $request, Employee $employee, EmployeeDocument $document): JsonResponse
    {
        $this->authorize('update', $employee);

        abort_unless($document->employee_id === $employee->id, 404);

        $employee = $this->employeeService->deleteDocument(
            $employee,
            $document,
            $request->user('api'),
        );

        return ApiResponse::success(
            new EmployeeResource($employee),
            'Employee document deleted successfully.',
        );
    }

    public function auditLogs(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        $logs = $this->employeeService->auditLogs(
            $employee,
            perPage: (int) $request->integer('per_page', 20),
        );

        return ApiResponse::success(
            AuditLogResource::collection($logs->items()),
            meta: [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        );
    }
}
