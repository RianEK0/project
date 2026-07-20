<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'legal_name',
        'email',
        'phone',
        'website',
        'address',
        'description',
    ];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
