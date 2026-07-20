<?php

namespace Tests\Feature\Payroll;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;
use Tests\TestCase;

class PayrollWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_payroll_officer_can_generate_a_payroll_run_from_salary_history_and_overtime(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employeeIds = \Modules\Workforce\Infrastructure\Persistence\Models\Employee::query()
            ->whereIn('employee_number', ['EMP-0001', 'EMP-0002', 'EMP-0003'])
            ->pluck('id')
            ->all();

        $response = $this->postJson('/api/v1/payroll/runs', [
            'payroll_month' => '2026-07',
            'title' => 'Payroll July 2026',
            'period_start' => '2026-07-01',
            'period_end' => '2026-07-31',
            'tax_rate' => 0.05,
            'bpjs_health_rate' => 0.01,
            'bpjs_employment_rate' => 0.02,
            'overtime_multiplier' => 1,
            'include_thr' => false,
            'employee_ids' => $employeeIds,
        ], $this->authenticateEmail('mira.payroll@enterprise-hris.local'));

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_hr')
            ->assertJsonPath('data.summary.employees_count', 3)
            ->assertJsonCount(3, 'data.items');

        $nadiaItem = collect($response->json('data.items'))
            ->firstWhere('employee.employee_number', 'EMP-0003');

        $this->assertNotNull($nadiaItem);
        $this->assertSame(65, $nadiaItem['overtime_minutes']);
        $this->assertSame(17343930.63, $nadiaItem['gross_amount']);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payroll.run.generated',
        ]);
    }

    public function test_payroll_run_flows_from_hr_manager_to_super_admin_approval(): void
    {
        $this->seed(DatabaseSeeder::class);

        $runResponse = $this->postJson('/api/v1/payroll/runs', [
            'payroll_month' => '2026-07',
            'title' => 'Payroll July 2026',
            'period_start' => '2026-07-01',
            'period_end' => '2026-07-31',
            'tax_rate' => 0.05,
            'bpjs_health_rate' => 0.01,
            'bpjs_employment_rate' => 0.02,
            'overtime_multiplier' => 1,
        ], $this->authenticateEmail('mira.payroll@enterprise-hris.local'));

        $runId = $runResponse->json('data.id');

        $this->postJson("/api/v1/payroll/runs/{$runId}/approve", [
            'remarks' => 'HR approval completed after payroll review.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'))
            ->assertOk()
            ->assertJsonPath('data.status', 'pending_super_admin');

        $this->postJson("/api/v1/payroll/runs/{$runId}/approve", [
            'remarks' => 'Super admin approval completed.',
        ], $this->authenticateEmail('admin@enterprise-hris.local'))
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payroll.run.approved',
        ]);
    }

    public function test_employee_only_sees_own_payslips_and_can_download_pdf(): void
    {
        $this->seed(DatabaseSeeder::class);

        $payslipsResponse = $this->getJson('/api/v1/payroll/payslips', $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $payslipsResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.employee.employee_number', 'EMP-0003')
            ->assertJsonPath('data.0.payroll_run.payroll_month', '2026-06');

        $run = PayrollRun::query()->where('payroll_month', '2026-06')->firstOrFail();

        $this->getJson("/api/v1/payroll/runs/{$run->id}", $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.employee.employee_number', 'EMP-0003');

        $visiblePayslip = PayrollItem::query()
            ->whereHas('employee.user', static fn ($query) => $query->where('email', 'nadia.putri@enterprise-hris.local'))
            ->whereHas('payrollRun', static fn ($query) => $query->where('payroll_month', '2026-06'))
            ->firstOrFail();

        $this->get("/api/v1/payroll/payslips/{$visiblePayslip->id}/pdf", [
            'Accept' => 'application/pdf',
            ...$this->authenticateEmail('nadia.putri@enterprise-hris.local'),
        ])->assertOk()->assertHeader('content-type', 'application/pdf');

        $otherPayslip = PayrollItem::query()
            ->whereKeyNot($visiblePayslip->id)
            ->firstOrFail();

        $this->get("/api/v1/payroll/payslips/{$otherPayslip->id}/pdf", [
            'Accept' => 'application/pdf',
            ...$this->authenticateEmail('nadia.putri@enterprise-hris.local'),
        ])->assertNotFound();
    }

    public function test_payroll_run_pdf_and_excel_exports_are_downloadable(): void
    {
        $this->seed(DatabaseSeeder::class);

        $run = PayrollRun::query()->where('payroll_month', '2026-06')->firstOrFail();

        $pdfResponse = $this->get("/api/v1/payroll/runs/{$run->id}/export/pdf", [
            'Accept' => 'application/pdf',
            ...$this->authenticateEmail('mira.payroll@enterprise-hris.local'),
        ]);

        $pdfResponse
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertStringStartsWith('%PDF-', $pdfResponse->getContent());

        $excelResponse = $this->get("/api/v1/payroll/runs/{$run->id}/export/excel", [
            'Accept' => 'application/vnd.ms-excel',
            ...$this->authenticateEmail('mira.payroll@enterprise-hris.local'),
        ]);

        $excelResponse
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.ms-excel');

        $this->assertStringContainsString('<Workbook', $excelResponse->getContent());
    }
}
