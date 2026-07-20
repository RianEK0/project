<?php

namespace Modules\AccessControl\Infrastructure\Persistence\Repositories;

use App\Models\User;
use Illuminate\Support\Collection;
use Modules\AccessControl\Domain\Contracts\UserRepository;

class EloquentUserRepository implements UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->with('roles.permissions')
            ->where('email', $email)
            ->first();
    }

    public function findById(int $id): ?User
    {
        return User::query()
            ->with('roles.permissions')
            ->find($id);
    }

    public function administrators(): Collection
    {
        return User::query()
            ->with('roles.permissions')
            ->whereHas('roles', static fn ($query) => $query->where('name', 'super-admin'))
            ->get();
    }
}
