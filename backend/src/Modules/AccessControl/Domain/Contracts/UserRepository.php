<?php

namespace Modules\AccessControl\Domain\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;

interface UserRepository
{
    public function findByEmail(string $email): ?User;

    public function findById(int $id): ?User;

    /**
     * @return Collection<int, User>
     */
    public function administrators(): Collection;
}
