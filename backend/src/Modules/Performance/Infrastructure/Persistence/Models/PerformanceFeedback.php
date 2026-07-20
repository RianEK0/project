<?php

namespace Modules\Performance\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class PerformanceFeedback extends Model
{
    /**
     * @var list<string>
     */
    protected $table = 'performance_feedback';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'review_id',
        'reviewer_id',
        'reviewer_user_id',
        'feedback_type',
        'relationship',
        'strengths',
        'improvements',
        'comments',
        'rating',
        'is_anonymous',
        'submitted_at',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'is_anonymous' => 'boolean',
            'submitted_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'review_id');
    }

    public function reviewerEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }

    public function reviewerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }
}
