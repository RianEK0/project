<?php

namespace Modules\Recruitment\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentAssessment extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'title',
        'assessment_type',
        'assigned_at',
        'due_at',
        'completed_at',
        'status',
        'score',
        'max_score',
        'result',
        'notes',
        'reviewer_id',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'meta' => 'array',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(RecruitmentApplication::class, 'application_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
