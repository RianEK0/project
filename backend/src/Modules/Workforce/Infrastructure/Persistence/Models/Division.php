<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'department_id',
        'name',
        'code',
        'description',
        'head_employee_id',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'head_employee_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }
}
