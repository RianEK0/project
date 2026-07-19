<?php

namespace Modules\AccessControl\Application\DTO;

use Shared\Application\DTO\DataTransferObject;

final readonly class LoginData extends DataTransferObject
{
    public function __construct(
        public string $email,
        public string $password,
    ) {
    }

    /**
     * @param  array{email: string, password: string}  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            email: $payload['email'],
            password: $payload['password'],
        );
    }
}
