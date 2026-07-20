<?php

namespace Database\Seeders\Payroll;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeSalaryHistory;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $payrollOfficer = User::query()->where('email', 'mira.payroll@enterprise-hris.local')->first()
            ?? User::query()->where('email', 'admin@enterprise-hris.local')->first();
        $superAdmin = User::query()->where('email', 'admin@enterprise-hris.local')->first();
        $employees = Employee::query()
            ->with('salaryHistories')
            ->whereIn('employee_number', ['EMP-0001', 'EMP-0002', 'EMP-0003'])
            ->get();

        if (! $payrollOfficer || ! $superAdmin || $employees->isEmpty()) {
            return;
        }

        $run = PayrollRun::query()->updateOrCreate(
            ['payroll_month' => '2026-06'],
            [
                'title' => 'Payroll June 2026',
                'period_start' => '2026-06-01',
                'period_end' => '2026-06-30',
                'status' => 'approved',
                'overtime_rate_per_hour' => null,
                'overtime_multiplier' => 1,
                'tax_rate' => 0.05,
                'bpjs_health_rate' => 0.01,
                'bpjs_employment_rate' => 0.02,
                'submitted_by' => $payrollOfficer->id,
                'reviewer_id' => $superAdmin->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
                'notes' => 'Seeded approved payroll history for June 2026.',
                'meta' => [
                    'include_thr' => false,
                    'formula_note' => 'Tax and BPJS are configurable payroll estimates per run.',
                ],
            ],
        );

        $run->approvals()->delete();
        $run->items()->delete();

        foreach ($employees as $employee) {
            $snapshot = $this->salarySnapshot($employee);
            $basicSalary = $snapshot['basic_salary'];
            $allowanceAmount = $snapshot['allowance_amount'];
            $bpjsAmount = round(($basicSalary + $allowanceAmount) * 0.03, 2);
            $grossAmount = round($basicSalary + $allowanceAmount, 2);
            $taxAmount = round($grossAmount * 0.05, 2);
            $netAmount = round($grossAmount - $taxAmount - $bpjsAmount, 2);

            PayrollItem::query()->create([
                'payroll_run_id' => $run->id,
                'employee_id' => $employee->id,
                'currency' => $snapshot['currency'],
                'basic_salary' => $basicSalary,
                'allowance_amount' => $allowanceAmount,
                'deduction_amount' => 0,
                'tax_amount' => $taxAmount,
                'bpjs_amount' => $bpjsAmount,
                'overtime_minutes' => 0,
                'overtime_amount' => 0,
                'bonus_amount' => 0,
                'thr_amount' => 0,
                'gross_amount' => $grossAmount,
                'net_amount' => $netAmount,
                'notes' => 'Seeded payroll history item.',
                'generated_at' => now(),
                'meta' => [
                    'salary_breakdown' => $snapshot['breakdown'],
                    'allowance_breakdown' => $snapshot['allowance_breakdown'],
                    'deduction_breakdown' => [],
                    'formula' => [
                        'overtime_rate_per_hour' => round($basicSalary / 173, 2),
                        'overtime_multiplier' => 1,
                        'tax_rate' => 0.05,
                        'bpjs_health_rate' => 0.01,
                        'bpjs_employment_rate' => 0.02,
                    ],
                    'employee_number' => $employee->employee_number,
                    'employee_name' => $employee->full_name,
                ],
            ]);
        }

        $run->refresh()->load('items');
        $run->update([
            'meta' => array_merge($run->meta ?? [], [
                'summary' => [
                    'employees_count' => $run->items->count(),
                    'basic_salary_total' => round($run->items->sum('basic_salary'), 2),
                    'allowance_total' => round($run->items->sum('allowance_amount'), 2),
                    'deduction_total' => round($run->items->sum('deduction_amount'), 2),
                    'tax_total' => round($run->items->sum('tax_amount'), 2),
                    'bpjs_total' => round($run->items->sum('bpjs_amount'), 2),
                    'overtime_total' => round($run->items->sum('overtime_amount'), 2),
                    'bonus_total' => round($run->items->sum('bonus_amount'), 2),
                    'thr_total' => round($run->items->sum('thr_amount'), 2),
                    'gross_total' => round($run->items->sum('gross_amount'), 2),
                    'net_total' => round($run->items->sum('net_amount'), 2),
                ],
            ]),
        ]);
    }

    /**
     * @return array{
     *   basic_salary: float,
     *   allowance_amount: float,
     *   currency: string,
     *   breakdown: array<int, array<string, mixed>>,
     *   allowance_breakdown: array<int, array<string, mixed>>
     * }
     */
    private function salarySnapshot(Employee $employee): array
    {
        $histories = $employee->salaryHistories()
            ->where(function ($query): void {
                $query->whereNull('end_date')->orWhereDate('end_date', '>=', '2026-06-30');
            })
            ->whereDate('effective_date', '<=', '2026-06-30')
            ->orderByDesc('is_current')
            ->orderByDesc('effective_date')
            ->orderByDesc('id')
            ->get()
            ->values();

        /** @var EmployeeSalaryHistory|null $baseSalaryHistory */
        $baseSalaryHistory = $histories->first(function (EmployeeSalaryHistory $history): bool {
            return str_contains(strtolower($history->component), 'base salary');
        }) ?? $histories->first();

        if (! $baseSalaryHistory) {
            return [
                'basic_salary' => 0.0,
                'allowance_amount' => 0.0,
                'currency' => 'IDR',
                'breakdown' => [],
                'allowance_breakdown' => [],
            ];
        }

        $allowanceHistories = $histories->reject(
            static fn (EmployeeSalaryHistory $history): bool => $history->id === $baseSalaryHistory->id,
        );

        return [
            'basic_salary' => (float) $baseSalaryHistory->amount,
            'allowance_amount' => round($allowanceHistories->sum('amount'), 2),
            'currency' => $baseSalaryHistory->currency ?: 'IDR',
            'breakdown' => $histories->map(static fn (EmployeeSalaryHistory $history): array => [
                'component' => $history->component,
                'amount' => (float) $history->amount,
                'currency' => $history->currency,
                'pay_frequency' => $history->pay_frequency,
            ])->values()->all(),
            'allowance_breakdown' => $allowanceHistories->map(static fn (EmployeeSalaryHistory $history): array => [
                'component' => $history->component,
                'amount' => (float) $history->amount,
                'currency' => $history->currency,
            ])->values()->all(),
        ];
    }
}
