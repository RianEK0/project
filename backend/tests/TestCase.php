<?php

namespace Tests;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Str;

abstract class TestCase extends BaseTestCase
{
    /**
     * @return array<string, string>
     */
    protected function authenticateUser(User $user, bool $remember = false): array
    {
        $session = AuthSession::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'device_name' => 'PHPUnit Test Runner',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'remember' => $remember,
            'last_seen_at' => now(),
            'last_refreshed_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        $token = auth('api')
            ->claims([
                'sid' => $session->id,
                'type' => 'access',
                'remember' => $remember,
            ])
            ->setTTL(config('security.access_token_ttl_minutes'))
            ->login($user);

        return [
            'Authorization' => 'Bearer '.$token,
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function authenticateEmail(string $email, bool $remember = false): array
    {
        $user = User::query()->where('email', $email)->firstOrFail();

        return $this->authenticateUser($user, $remember);
    }
}
