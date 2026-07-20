<?php

namespace Modules\AccessControl\Application\DTO;

use Shared\Application\DTO\DataTransferObject;

final readonly class LoginData extends DataTransferObject
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember,
        public string $captchaId,
        public string $captchaAnswer,
        public ?string $deviceName,
    ) {
    }

    /**
     * @param  array{email: string, password: string, remember?: bool, captcha_id: string, captcha_answer: string, device_name?: string|null}  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            email: $payload['email'],
            password: $payload['password'],
            remember: (bool) ($payload['remember'] ?? false),
            captchaId: $payload['captcha_id'],
            captchaAnswer: $payload['captcha_answer'],
            deviceName: $payload['device_name'] ?? null,
        );
    }
}
