<?php

namespace App\Http\Controllers\Api\V1\Workforce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workforce\StoreEmployeeRequest;
use App\Http\Requests\Workforce\UpdateEmployeeRequest;
use App\Http\Resources\Workforce\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Workforce\Application\DTO\EmployeeData;
use Modules\Workforce\Application\Services\EmployeeService;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ApiResponse;

class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $employees = $this->employeeService->paginate(
            perPage: (int) $request->integer('per_page', 15),
            search: $request->string('search')->toString() ?: null,
        );

        return ApiResponse::success(
            EmployeeResource::collection($employees->items()),
            meta: [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
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

        return ApiResponse::success(new EmployeeResource($employee->loadMissing('department', 'team', 'manager', 'user')));
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
}
