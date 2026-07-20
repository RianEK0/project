<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSalaryHistory extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'component',
        'amount',
        'currency',
        'pay_frequency',
        'effective_date',
        'end_date',
        'is_current',
        'notes',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'effective_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
