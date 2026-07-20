<?php

namespace Modules\AccessControl\Application\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthCaptchaService
{
    private const CACHE_PREFIX = 'auth:captcha:';

    public function issue(): array
    {
        $captchaId = (string) Str::ulid();
        $answer = $this->generateAnswer();

        Cache::put(
            $this->cacheKey($captchaId),
            hash('sha256', strtoupper($answer)),
            now()->addMinutes(config('security.captcha.ttl_minutes'))
        );

        $payload = [
            'captcha_id' => $captchaId,
            'image' => $this->renderDataUri($answer),
            'expires_at' => now()->addMinutes(config('security.captcha.ttl_minutes'))->toIso8601String(),
        ];

        if (app()->environment('testing')) {
            $payload['test_answer'] = $answer;
        }

        return $payload;
    }

    public function verify(string $captchaId, string $answer, bool $forget = true): bool
    {
        $expected = Cache::get($this->cacheKey($captchaId));

        if (! is_string($expected) || $expected === '') {
            return false;
        }

        $valid = hash_equals($expected, hash('sha256', strtoupper(trim($answer))));

        if ($valid && $forget) {
            Cache::forget($this->cacheKey($captchaId));
        }

        return $valid;
    }

    public function assertValid(string $captchaId, string $answer): void
    {
        if (! $this->verify($captchaId, $answer)) {
            throw ValidationException::withMessages([
                'captcha_answer' => 'CAPTCHA tidak valid atau sudah kedaluwarsa.',
            ]);
        }
    }

    private function cacheKey(string $captchaId): string
    {
        return self::CACHE_PREFIX.$captchaId;
    }

    private function generateAnswer(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $value = '';

        for ($index = 0; $index < config('security.captcha.length'); $index++) {
            $value .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        return $value;
    }

    private function renderDataUri(string $answer): string
    {
        $characters = str_split($answer);
        $chunks = [];

        foreach ($characters as $index => $character) {
            $x = 24 + ($index * 26);
            $y = 34 + random_int(-4, 5);
            $rotation = random_int(-16, 16);

            $chunks[] = sprintf(
                '<text x="%d" y="%d" transform="rotate(%d %d %d)" fill="#13233c" font-size="24" font-family="monospace" font-weight="700">%s</text>',
                $x,
                $y,
                $rotation,
                $x,
                $y,
                $character
            );
        }

        $lines = [];

        for ($index = 0; $index < 4; $index++) {
            $lines[] = sprintf(
                '<path d="M %d %d C %d %d, %d %d, %d %d" stroke="rgba(185,123,49,0.45)" stroke-width="2" fill="none" />',
                random_int(0, 30),
                random_int(10, 54),
                random_int(45, 85),
                random_int(0, 60),
                random_int(95, 135),
                random_int(0, 60),
                random_int(140, 180),
                random_int(10, 54),
            );
        }

        $svg = sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="64" viewBox="0 0 180 64" role="img" aria-label="Security captcha"><rect width="180" height="64" rx="18" fill="#f8efe2"/><rect x="1" y="1" width="178" height="62" rx="17" fill="none" stroke="rgba(19,35,60,0.12)"/>%s%s</svg>',
            implode('', $lines),
            implode('', $chunks),
        );

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }
}
