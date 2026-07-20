<?php

namespace Database\Seeders\Assets;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Assets\Infrastructure\Persistence\Models\ItAsset;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetAssignment;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetMaintenance;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class ItAssetSeeder extends Seeder
{
    public function run(): void
    {
        $jakartaBranch = Branch::query()->where('code', 'JKT-HQ')->first();
        $bandungBranch = Branch::query()->where('code', 'BDG-HUB')->first();
        $itSupport = User::query()->where('email', 'nara.support@enterprise-hris.local')->first()
            ?? User::query()->where('email', 'admin@enterprise-hris.local')->first();
        $nadia = Employee::query()->where('employee_number', 'EMP-0003')->first();
        $rafi = Employee::query()->where('employee_number', 'EMP-0002')->first();
        $alya = Employee::query()->where('employee_number', 'EMP-0001')->first();

        if (! $jakartaBranch || ! $bandungBranch || ! $itSupport || ! $nadia || ! $rafi || ! $alya) {
            return;
        }

        $today = today();

        $laptop = ItAsset::query()->updateOrCreate(
            ['asset_code' => 'AST-LTP-0001'],
            [
                'category' => 'laptop',
                'name' => 'MacBook Pro 14',
                'brand' => 'Apple',
                'model' => 'M3 Pro',
                'serial_number' => 'SN-LTP-0001',
                'vendor_name' => 'Nusantara Devices',
                'purchase_date' => '2026-01-15',
                'purchase_cost' => 32000000,
                'currency' => 'IDR',
                'branch_id' => $bandungBranch->id,
                'warranty_expires_at' => $today->copy()->addDays(28)->toDateString(),
                'maintenance_due_at' => $today->copy()->addDays(50)->toDateString(),
                'status' => 'assigned',
                'qr_code_value' => 'ITA:AST-LTP-0001',
                'notes' => 'Primary engineering workstation currently assigned to Nadia Putri.',
                'created_by' => $itSupport->id,
                'meta' => [
                    'category_label' => 'Laptop',
                    'department_hint' => 'Engineering',
                ],
            ],
        );

        $monitor = ItAsset::query()->updateOrCreate(
            ['asset_code' => 'AST-MON-0001'],
            [
                'category' => 'monitor',
                'name' => 'UltraSharp 27',
                'brand' => 'Dell',
                'model' => 'U2724D',
                'serial_number' => 'SN-MON-0001',
                'vendor_name' => 'Display One',
                'purchase_date' => '2026-03-08',
                'purchase_cost' => 5800000,
                'currency' => 'IDR',
                'branch_id' => $jakartaBranch->id,
                'warranty_expires_at' => $today->copy()->addDays(14)->toDateString(),
                'maintenance_due_at' => $today->copy()->addDays(90)->toDateString(),
                'status' => 'available',
                'qr_code_value' => 'ITA:AST-MON-0001',
                'notes' => 'Spare productivity monitor ready for new assignment.',
                'created_by' => $itSupport->id,
            ],
        );

        $printer = ItAsset::query()->updateOrCreate(
            ['asset_code' => 'AST-PRN-0001'],
            [
                'category' => 'printer',
                'name' => 'LaserJet Enterprise',
                'brand' => 'HP',
                'model' => 'M611dn',
                'serial_number' => 'SN-PRN-0001',
                'vendor_name' => 'PrintCare Indonesia',
                'purchase_date' => '2025-11-21',
                'purchase_cost' => 8700000,
                'currency' => 'IDR',
                'branch_id' => $jakartaBranch->id,
                'warranty_expires_at' => $today->copy()->addDays(9)->toDateString(),
                'maintenance_due_at' => $today->copy()->addDays(3)->toDateString(),
                'status' => 'maintenance',
                'qr_code_value' => 'ITA:AST-PRN-0001',
                'notes' => 'Shared office printer waiting for toner feeder maintenance.',
                'created_by' => $itSupport->id,
            ],
        );

        $phone = ItAsset::query()->updateOrCreate(
            ['asset_code' => 'AST-PHN-0001'],
            [
                'category' => 'phone',
                'name' => 'Galaxy Enterprise',
                'brand' => 'Samsung',
                'model' => 'S26',
                'serial_number' => 'SN-PHN-0001',
                'phone_number' => '+6281210010001',
                'vendor_name' => 'Mobile Nusantara',
                'purchase_date' => '2026-02-05',
                'purchase_cost' => 12800000,
                'currency' => 'IDR',
                'branch_id' => $jakartaBranch->id,
                'warranty_expires_at' => $today->copy()->addDays(120)->toDateString(),
                'maintenance_due_at' => $today->copy()->addDays(65)->toDateString(),
                'status' => 'available',
                'qr_code_value' => 'ITA:AST-PHN-0001',
                'notes' => 'Corporate phone kept as a pooled executive backup device.',
                'created_by' => $itSupport->id,
            ],
        );

        $license = ItAsset::query()->updateOrCreate(
            ['asset_code' => 'AST-LIC-0001'],
            [
                'category' => 'software_license',
                'name' => 'Figma Organization Seat',
                'brand' => 'Figma',
                'model' => 'Organization',
                'license_key' => 'FIGMA-ORG-2026-001',
                'license_expires_at' => $today->copy()->addDays(17)->toDateString(),
                'vendor_name' => 'Figma',
                'purchase_date' => '2026-01-01',
                'purchase_cost' => 4800000,
                'currency' => 'IDR',
                'branch_id' => $jakartaBranch->id,
                'maintenance_due_at' => $today->copy()->addDays(120)->toDateString(),
                'status' => 'assigned',
                'qr_code_value' => 'ITA:AST-LIC-0001',
                'notes' => 'Shared design seat currently allocated to HR operations for collateral review.',
                'created_by' => $itSupport->id,
            ],
        );

        ItAssetAssignment::query()->updateOrCreate(
            [
                'asset_id' => $laptop->id,
                'employee_id' => $nadia->id,
                'status' => 'active',
            ],
            [
                'assigned_by' => $itSupport->id,
                'assigned_at' => '2026-07-10 09:30:00',
                'expected_return_at' => '2026-12-31',
                'assignment_condition' => 'excellent',
                'assignment_notes' => 'Issued as Nadia Putri primary workstation.',
                'returned_by' => null,
                'returned_at' => null,
                'return_condition' => null,
                'return_notes' => null,
                'meta' => [
                    'approval_channel' => 'it-support',
                ],
            ],
        );

        ItAssetAssignment::query()->updateOrCreate(
            [
                'asset_id' => $license->id,
                'employee_id' => $rafi->id,
                'status' => 'active',
            ],
            [
                'assigned_by' => $itSupport->id,
                'assigned_at' => '2026-07-01 10:00:00',
                'expected_return_at' => '2026-09-30',
                'assignment_condition' => 'good',
                'assignment_notes' => 'Used for employer branding and policy deck production.',
                'returned_by' => null,
                'returned_at' => null,
                'return_condition' => null,
                'return_notes' => null,
                'meta' => [
                    'seat_type' => 'shared-service',
                ],
            ],
        );

        ItAssetAssignment::query()->updateOrCreate(
            [
                'asset_id' => $phone->id,
                'employee_id' => $alya->id,
                'status' => 'returned',
            ],
            [
                'assigned_by' => $itSupport->id,
                'assigned_at' => '2026-05-01 08:15:00',
                'expected_return_at' => '2026-06-30',
                'assignment_condition' => 'good',
                'assignment_notes' => 'Temporary assignment during manager travel.',
                'returned_by' => $itSupport->id,
                'returned_at' => '2026-06-30 17:20:00',
                'return_condition' => 'good',
                'return_notes' => 'Returned to IT pool after travel period ended.',
                'meta' => [
                    'trip_code' => 'ENG-ROADSHOW',
                ],
            ],
        );

        ItAssetMaintenance::query()->updateOrCreate(
            [
                'asset_id' => $printer->id,
                'maintenance_type' => 'corrective',
                'status' => 'in_progress',
            ],
            [
                'reported_by' => $itSupport->id,
                'vendor_name' => 'PrintCare Indonesia',
                'scheduled_at' => '2026-07-18',
                'started_at' => '2026-07-19 09:00:00',
                'completed_at' => null,
                'warranty_claim' => true,
                'cost_amount' => 0,
                'currency' => 'IDR',
                'notes' => 'Paper feed roller slipping during high-volume payroll print batch.',
                'resolution' => null,
                'meta' => [
                    'ticket' => 'ITSM-4021',
                ],
            ],
        );

        ItAssetMaintenance::query()->updateOrCreate(
            [
                'asset_id' => $laptop->id,
                'maintenance_type' => 'preventive',
                'status' => 'completed',
            ],
            [
                'reported_by' => $itSupport->id,
                'vendor_name' => 'Nusantara Devices',
                'scheduled_at' => '2026-06-24',
                'started_at' => '2026-06-24 13:00:00',
                'completed_at' => '2026-06-24 15:30:00',
                'warranty_claim' => false,
                'cost_amount' => 350000,
                'currency' => 'IDR',
                'notes' => 'Routine thermal cleanup and device health diagnostics.',
                'resolution' => 'Thermal module cleaned and battery health confirmed normal.',
                'meta' => [
                    'ticket' => 'ITSM-3984',
                ],
            ],
        );

        $laptop->forceFill(['status' => 'assigned'])->save();
        $monitor->forceFill(['status' => 'available'])->save();
        $printer->forceFill(['status' => 'maintenance'])->save();
        $phone->forceFill(['status' => 'available'])->save();
        $license->forceFill(['status' => 'assigned'])->save();
    }
}
