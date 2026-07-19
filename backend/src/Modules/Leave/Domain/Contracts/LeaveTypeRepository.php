<?php

namespace Modules\Leave\Domain\Contracts;

use Illuminate\Support\Collection;

interface LeaveTypeRepository
{
    public function active(): Collection;
}
