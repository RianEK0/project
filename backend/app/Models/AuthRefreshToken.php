<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthRefreshToken extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'auth_session_id',
        'token_hash',
        'replaced_by_token_id',
        'last_used_at',
        'expires_at',
        'revoked_at',
        'revoked_reason',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function authSession(): BelongsTo
    {
        return $this->belongsTo(AuthSession::class);
    }
}
