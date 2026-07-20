<?php

namespace Modules\Payroll\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'payroll_month',
        'title',
        'period_start',
        'period_end',
        'status',
        'overtime_rate_per_hour',
        'overtime_multiplier',
        'tax_rate',
        'bpjs_health_rate',
        'bpjs_employment_rate',
        'submitted_by',
        'reviewer_id',
        'reviewed_at',
        'rejection_reason',
        'notes',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'reviewed_at' => 'datetime',
            'meta' => 'array',
            'overtime_rate_per_hour' => 'decimal:2',
            'overtime_multiplier' => 'decimal:2',
            'tax_rate' => 'decimal:4',
            'bpjs_health_rate' => 'decimal:4',
            'bpjs_employment_rate' => 'decimal:4',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class)->orderBy('employee_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(PayrollRunApproval::class)->orderBy('id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
