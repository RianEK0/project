<?php

namespace Modules\Workforce\Domain\Contracts;

use Illuminate\Support\Collection;

interface DepartmentRepository
{
    public function all(): Collection;
}
