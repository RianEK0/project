<?php

namespace Modules\Recruitment\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentInterview extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'application_id',
        'title',
        'interview_type',
        'stage',
        'scheduled_at',
        'duration_minutes',
        'location',
        'interviewer_id',
        'status',
        'score',
        'feedback',
        'notes',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'score' => 'decimal:2',
            'meta' => 'array',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(RecruitmentApplication::class, 'application_id');
    }

    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}
