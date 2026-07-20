<?php

namespace Modules\Organization\Application\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Organization\Application\DTO\TeamData;
use Modules\Organization\Domain\Contracts\TeamRepository;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Shared\Application\Support\ListQueryOptions;

class TeamService
{
    public function __construct(
        private readonly TeamRepository $teams,
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return Collection<int, Team>
     */
    public function paginate(ListQueryOptions $query)
    {
        return $this->teams->paginate($query);
    }

    public function create(TeamData $data, User $actor): Team
    {
        $team = $this->teams->create($data->toArray());
        $team->loadMissing(['department', 'lead', 'employees']);

        $this->auditLogs->record(
            actor: $actor,
            auditable: $team,
            action: 'organization.team.created',
            summary: "Team {$team->code} created.",
            newValues: $team->toArray(),
        );

        return $team;
    }

    /**
     * @return Collection<int, Department>
     */
    public function structure(): Collection
    {
        return Department::query()
            ->withCount(['employees', 'teams'])
            ->with([
                'teams' => static function ($query): void {
                    $query->with(['lead'])->withCount('employees')->orderBy('name');
                },
            ])
            ->orderBy('name')
            ->get();
    }
}
