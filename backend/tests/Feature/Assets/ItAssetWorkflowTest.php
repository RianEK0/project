<?php

namespace Tests\Feature\Assets;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Assets\Infrastructure\Persistence\Models\ItAsset;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetAssignment;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class ItAssetWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_support_can_create_and_assign_asset(): void
    {
        $this->seed(DatabaseSeeder::class);
        $branch = Branch::query()->where('code', 'JKT-HQ')->firstOrFail();
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $createResponse = $this->postJson('/api/v1/assets', [
            'category' => 'laptop',
            'name' => 'ThinkPad X1 Carbon',
            'brand' => 'Lenovo',
            'model' => 'Gen 14',
            'serial_number' => 'SN-LTP-0101',
            'vendor_name' => 'Enterprise Devices',
            'purchase_date' => '2026-07-12',
            'purchase_cost' => 29500000,
            'currency' => 'IDR',
            'branch_id' => $branch->id,
            'warranty_expires_at' => '2027-07-12',
            'maintenance_due_at' => '2026-10-12',
            'notes' => 'Reserved for new engineering starter kit.',
        ], $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.category', 'laptop')
            ->assertJsonPath('data.status', 'available');

        $assetId = $createResponse->json('data.id');
        $assetCode = $createResponse->json('data.asset_code');

        $this->assertNotNull($assetId);
        $this->assertNotNull($assetCode);
        $this->assertStringStartsWith('AST-LTP-', $assetCode);
        $this->assertSame("ITA:{$assetCode}", $createResponse->json('data.qr_code_value'));

        $assignResponse = $this->postJson("/api/v1/assets/{$assetId}/assignments", [
            'employee_id' => $employee->id,
            'assigned_at' => '2026-07-19 09:30:00',
            'expected_return_at' => '2026-12-31',
            'assignment_condition' => 'excellent',
            'assignment_notes' => 'Assigned as onboarding hardware for Nadia Putri.',
        ], $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $assignResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.employee.employee_number', 'EMP-0003')
            ->assertJsonPath('data.asset.asset_code', $assetCode);

        $showResponse = $this->getJson("/api/v1/assets/{$assetId}", $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $showResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'assigned')
            ->assertJsonPath('data.current_assignment.employee.employee_number', 'EMP-0003');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'asset.created',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'asset.assigned',
        ]);
    }

    public function test_return_and_maintenance_update_asset_history_and_overview(): void
    {
        $this->seed(DatabaseSeeder::class);

        $asset = ItAsset::query()->where('asset_code', 'AST-LTP-0001')->firstOrFail();
        $assignment = ItAssetAssignment::query()
            ->where('asset_id', $asset->id)
            ->where('status', 'active')
            ->firstOrFail();

        $returnResponse = $this->postJson("/api/v1/assets/assignments/{$assignment->id}/return", [
            'returned_at' => '2026-07-19 18:10:00',
            'return_condition' => 'good',
            'return_notes' => 'Returned after device refresh and handover completion.',
        ], $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $returnResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'returned')
            ->assertJsonPath('data.return_condition', 'good');

        $maintenanceResponse = $this->postJson("/api/v1/assets/{$asset->id}/maintenance", [
            'maintenance_type' => 'corrective',
            'vendor_name' => 'Nusantara Devices',
            'scheduled_at' => '2026-07-20',
            'status' => 'scheduled',
            'warranty_claim' => true,
            'cost_amount' => 0,
            'currency' => 'IDR',
            'notes' => 'Schedule keyboard replacement before the next assignment.',
            'resolution' => null,
            'next_maintenance_due_at' => '2026-08-20',
        ], $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $maintenanceResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.asset.asset_code', 'AST-LTP-0001');

        $detailResponse = $this->getJson("/api/v1/assets/{$asset->id}", $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $detailResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'maintenance')
            ->assertJsonFragment([
                'type' => 'return',
            ])
            ->assertJsonFragment([
                'type' => 'maintenance',
            ]);

        $overviewResponse = $this->getJson('/api/v1/assets/overview', $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $overviewResponse->assertOk();

        $this->assertGreaterThanOrEqual(1, $overviewResponse->json('data.stats.maintenance_assets'));
        $this->assertContains(
            'AST-LTP-0001',
            collect($overviewResponse->json('data.maintenance_queue'))->pluck('asset.asset_code')->all(),
        );

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'asset.returned',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'asset.maintenance.logged',
        ]);
    }

    public function test_user_without_asset_permission_cannot_view_asset_workspace(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson('/api/v1/assets/overview', $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertForbidden();
    }
}
