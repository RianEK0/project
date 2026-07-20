<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginHistory extends Model
{
    protected $fillable = [
        'user_id',
        'auth_session_id',
        'email',
        'successful',
        'two_factor_passed',
        'failure_reason',
        'device_name',
        'ip_address',
        'user_agent',
        'context',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'successful' => 'boolean',
            'two_factor_passed' => 'boolean',
            'context' => 'array',
            'attempted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function authSession(): BelongsTo
    {
        return $this->belongsTo(AuthSession::class);
    }
}
