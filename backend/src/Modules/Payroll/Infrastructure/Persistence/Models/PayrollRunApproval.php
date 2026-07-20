<?php

namespace Modules\Payroll\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollRunApproval extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'payroll_run_id',
        'approver_id',
        'stage',
        'status',
        'acted_at',
        'remarks',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'acted_at' => 'datetime',
        ];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
