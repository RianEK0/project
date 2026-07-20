<?php

namespace App\Http\Controllers\Api\V1\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\ApprovePayrollRunRequest;
use App\Http\Requests\Payroll\GeneratePayrollRunRequest;
use App\Http\Requests\Payroll\RejectPayrollRunRequest;
use App\Http\Requests\Payroll\UpdatePayrollItemRequest;
use App\Http\Resources\Payroll\PayrollItemResource;
use App\Http\Resources\Payroll\PayrollRunApprovalResource;
use App\Http\Resources\Payroll\PayrollRunResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Payroll\Application\Services\PayrollService;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;
use Symfony\Component\HttpFoundation\Response;

class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrolls,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->payrolls->overview($request->user('api'));

        return ApiResponse::success([
            'current_date' => $overview['current_date'],
            'latest_run' => $overview['latest_run'] ? (new PayrollRunResource($overview['latest_run']))->resolve() : null,
            'latest_payslip' => $overview['latest_payslip'] ? (new PayrollItemResource($overview['latest_payslip']))->resolve() : null,
            'stats' => $overview['stats'],
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        $lookups = $this->payrolls->lookups($request->user('api'));

        return ApiResponse::success([
            'employees' => collect($lookups['employees'])->map(static fn ($employee): array => [
                'id' => $employee->id,
                'employee_number' => $employee->employee_number,
                'full_name' => $employee->full_name,
                'department' => $employee->department?->name,
            ])->values()->all(),
            'defaults' => $lookups['defaults'],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['status', 'payroll_month'],
            allowedSorts: ['default', 'payroll_month', 'status', 'items_count'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $runs = $this->payrolls->runs($request->user('api'), $query);

        return ApiResponse::paginated(
            $runs,
            PayrollRunResource::collection($runs->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(GeneratePayrollRunRequest $request): JsonResponse
    {
        $run = $this->payrolls->generateRun(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PayrollRunResource($run),
            'Payroll run generated successfully.',
            201,
        );
    }

    public function show(Request $request, PayrollRun $payrollRun): JsonResponse
    {
        return ApiResponse::success(
            new PayrollRunResource(
                $this->payrolls->showRun($request->user('api'), $payrollRun),
            ),
        );
    }

    public function approvalInbox(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['stage'],
            allowedSorts: ['default', 'created_at', 'stage'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $approvals = $this->payrolls->approvalInbox($request->user('api'), $query);

        return ApiResponse::paginated(
            $approvals,
            PayrollRunApprovalResource::collection($approvals->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function payslips(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['payroll_month', 'employee_id'],
            allowedSorts: ['default', 'gross_amount', 'net_amount', 'payroll_month'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $payslips = $this->payrolls->payslips($request->user('api'), $query);

        return ApiResponse::paginated(
            $payslips,
            PayrollItemResource::collection($payslips->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function updateItem(UpdatePayrollItemRequest $request, PayrollItem $payrollItem): JsonResponse
    {
        $item = $this->payrolls->updateItem(
            $payrollItem,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PayrollItemResource($item),
            'Payroll item updated successfully.',
        );
    }

    public function approve(ApprovePayrollRunRequest $request, PayrollRun $payrollRun): JsonResponse
    {
        $run = $this->payrolls->approveRun(
            $payrollRun,
            $request->user('api'),
            $request->string('remarks')->toString() ?: null,
        );

        return ApiResponse::success(
            new PayrollRunResource($run),
            'Payroll run approved successfully.',
        );
    }

    public function reject(RejectPayrollRunRequest $request, PayrollRun $payrollRun): JsonResponse
    {
        $run = $this->payrolls->rejectRun(
            $payrollRun,
            $request->user('api'),
            $request->string('remarks')->toString(),
        );

        return ApiResponse::success(
            new PayrollRunResource($run),
            'Payroll run rejected successfully.',
        );
    }

    public function downloadPayslip(Request $request, PayrollItem $payrollItem): Response
    {
        $visibleItem = $this->payrolls->ensureItemVisible($request->user('api'), $payrollItem);

        return $this->downloadResponse(
            $this->payrolls->payslipPdf($visibleItem),
            sprintf('payslip-%s-%s.pdf', $visibleItem->payrollRun?->payroll_month ?? 'payroll', $visibleItem->employee?->employee_number ?? $visibleItem->id),
            'application/pdf',
        );
    }

    public function downloadRunPdf(Request $request, PayrollRun $payrollRun): Response
    {
        $visibleRun = $this->payrolls->showRun($request->user('api'), $payrollRun);

        return $this->downloadResponse(
            $this->payrolls->payrollRunPdf($visibleRun),
            sprintf('payroll-run-%s.pdf', $visibleRun->payroll_month),
            'application/pdf',
        );
    }

    public function downloadRunExcel(Request $request, PayrollRun $payrollRun): Response
    {
        $visibleRun = $this->payrolls->showRun($request->user('api'), $payrollRun);

        return $this->downloadResponse(
            $this->payrolls->payrollRunExcel($visibleRun),
            sprintf('payroll-run-%s.xls', $visibleRun->payroll_month),
            'application/vnd.ms-excel',
        );
    }

    private function downloadResponse(string $content, string $filename, string $contentType): Response
    {
        return response($content, 200, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
