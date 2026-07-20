<?php

namespace Modules\Performance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class PerformanceGoal extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'cycle_id',
        'employee_id',
        'manager_id',
        'title',
        'goal_type',
        'category',
        'description',
        'target_value',
        'current_value',
        'unit',
        'weight',
        'progress_percent',
        'status',
        'due_date',
        'notes',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_value' => 'float',
            'current_value' => 'float',
            'weight' => 'float',
            'progress_percent' => 'float',
            'due_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'cycle_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }
}
