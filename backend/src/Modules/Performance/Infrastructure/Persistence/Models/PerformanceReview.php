<?php

namespace Modules\Performance\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class PerformanceReview extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'cycle_id',
        'employee_id',
        'manager_id',
        'creator_id',
        'overall_score',
        'overall_rating',
        'status',
        'employee_review_summary',
        'employee_review_highlights',
        'employee_review_challenges',
        'employee_rating',
        'employee_submitted_at',
        'manager_review_summary',
        'manager_review_strengths',
        'manager_review_improvements',
        'manager_rating',
        'manager_submitted_at',
        'calibration_notes',
        'completed_at',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'overall_score' => 'float',
            'employee_rating' => 'float',
            'manager_rating' => 'float',
            'employee_submitted_at' => 'datetime',
            'manager_submitted_at' => 'datetime',
            'completed_at' => 'datetime',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(PerformanceFeedback::class, 'review_id')
            ->orderByDesc('submitted_at')
            ->orderByDesc('id');
    }
}
