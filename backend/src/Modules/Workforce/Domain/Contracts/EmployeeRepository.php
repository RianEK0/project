<?php

namespace Modules\Workforce\Domain\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ListQueryOptions;

interface EmployeeRepository
{
    public function paginate(ListQueryOptions $query): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Employee;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Employee $employee, array $attributes): Employee;

    public function delete(Employee $employee): void;

    /**
     * @return array<string, int>
     */
    public function metrics(): array;

    /**
     * @return Collection<int, Employee>
     */
    public function recent(int $limit = 5): Collection;
}
