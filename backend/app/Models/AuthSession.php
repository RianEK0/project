<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AuthSession extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'device_name',
        'ip_address',
        'user_agent',
        'remember',
        'context',
        'last_seen_at',
        'last_refreshed_at',
        'expires_at',
        'revoked_at',
        'revoked_reason',
    ];

    protected function casts(): array
    {
        return [
            'remember' => 'boolean',
            'context' => 'array',
            'last_seen_at' => 'datetime',
            'last_refreshed_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(AuthRefreshToken::class);
    }

    public function loginHistories(): HasMany
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now());
    }
}
