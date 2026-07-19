<?php

namespace Tests\Feature\Governance;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_view_audit_logs(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(15)->toDateString(),
            'reason' => 'Annual leave for personal appointments and rest.',
        ], $this->authenticateByEmail('nadia.putri@enterprise-hris.local'))->assertCreated();

        $response = $this->getJson('/api/v1/audit-logs', $this->authenticateByEmail('rafi.saputra@enterprise-hris.local'));

        $response
            ->assertOk()
            ->assertJsonPath('data.0.action', 'leave-request.created');
    }

    /**
     * @return array<string, string>
     */
    private function authenticateByEmail(string $email): array
    {
        $user = User::query()->where('email', $email)->firstOrFail();

        return [
            'Authorization' => 'Bearer '.auth('api')->login($user),
        ];
    }
}
