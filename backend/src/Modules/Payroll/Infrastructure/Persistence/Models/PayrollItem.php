<?php

namespace Modules\Payroll\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class PayrollItem extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'payroll_run_id',
        'employee_id',
        'currency',
        'basic_salary',
        'allowance_amount',
        'deduction_amount',
        'tax_amount',
        'bpjs_amount',
        'overtime_minutes',
        'overtime_amount',
        'bonus_amount',
        'thr_amount',
        'gross_amount',
        'net_amount',
        'notes',
        'generated_at',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
            'meta' => 'array',
            'basic_salary' => 'decimal:2',
            'allowance_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'bpjs_amount' => 'decimal:2',
            'overtime_minutes' => 'integer',
            'overtime_amount' => 'decimal:2',
            'bonus_amount' => 'decimal:2',
            'thr_amount' => 'decimal:2',
            'gross_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
        ];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
