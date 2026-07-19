<?php

namespace Modules\Leave\Infrastructure\Persistence\Repositories;

use Illuminate\Support\Collection;
use Modules\Leave\Domain\Contracts\LeaveTypeRepository;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;

class EloquentLeaveTypeRepository implements LeaveTypeRepository
{
    public function active(): Collection
    {
        return LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
