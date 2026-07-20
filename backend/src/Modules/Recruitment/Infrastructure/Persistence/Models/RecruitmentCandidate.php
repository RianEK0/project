<?php

namespace Modules\Recruitment\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class RecruitmentCandidate extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'candidate_code',
        'full_name',
        'email',
        'phone',
        'source',
        'location',
        'current_company',
        'current_position',
        'experience_years',
        'expected_salary',
        'currency',
        'summary',
        'linkedin_url',
        'portfolio_url',
        'status',
        'cv_disk',
        'cv_path',
        'cv_file_name',
        'cv_mime_type',
        'cv_file_size',
        'last_contacted_at',
        'hired_at',
        'meta',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'cv_url',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'experience_years' => 'decimal:2',
            'expected_salary' => 'decimal:2',
            'cv_file_size' => 'integer',
            'last_contacted_at' => 'datetime',
            'hired_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(RecruitmentApplication::class, 'candidate_id')->orderByDesc('applied_at')->orderByDesc('id');
    }

    public function getCvUrlAttribute(): ?string
    {
        if (! $this->cv_disk || ! $this->cv_path) {
            return null;
        }

        return Storage::disk($this->cv_disk)->url($this->cv_path);
    }
}
