<?php

namespace Modules\Recruitment\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class RecruitmentApplication extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'vacancy_id',
        'candidate_id',
        'recruiter_id',
        'hired_employee_id',
        'applied_at',
        'stage',
        'status',
        'rating',
        'offer_sent_at',
        'offer_accepted_at',
        'offer_letter_disk',
        'offer_letter_path',
        'offer_letter_file_name',
        'offer_letter_mime_type',
        'offer_letter_file_size',
        'rejection_reason',
        'notes',
        'meta',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'offer_letter_url',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
            'rating' => 'decimal:2',
            'offer_sent_at' => 'datetime',
            'offer_accepted_at' => 'datetime',
            'offer_letter_file_size' => 'integer',
            'meta' => 'array',
        ];
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(RecruitmentVacancy::class, 'vacancy_id');
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(RecruitmentCandidate::class, 'candidate_id');
    }

    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recruiter_id');
    }

    public function hiredEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'hired_employee_id');
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(RecruitmentInterview::class, 'application_id')->orderBy('scheduled_at')->orderBy('id');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(RecruitmentAssessment::class, 'application_id')->orderByDesc('assigned_at')->orderByDesc('id');
    }

    public function getOfferLetterUrlAttribute(): ?string
    {
        if (! $this->offer_letter_disk || ! $this->offer_letter_path) {
            return null;
        }

        return Storage::disk($this->offer_letter_disk)->url($this->offer_letter_path);
    }
}
