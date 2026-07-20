<?php

namespace Modules\Recruitment\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;

class RecruitmentVacancy extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'title',
        'employment_type',
        'workplace_type',
        'status',
        'department_id',
        'branch_id',
        'position_id',
        'recruiter_id',
        'hiring_manager_id',
        'openings_count',
        'min_experience_years',
        'salary_min',
        'salary_max',
        'currency',
        'publish_date',
        'close_date',
        'description',
        'requirements',
        'notes',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'publish_date' => 'date',
            'close_date' => 'date',
            'meta' => 'array',
            'openings_count' => 'integer',
            'min_experience_years' => 'decimal:2',
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recruiter_id');
    }

    public function hiringManager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'hiring_manager_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(RecruitmentApplication::class, 'vacancy_id')->orderByDesc('applied_at')->orderByDesc('id');
    }
}
