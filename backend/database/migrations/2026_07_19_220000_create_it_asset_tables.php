<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('it_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('asset_code', 40)->unique();
            $table->string('category', 40);
            $table->string('name', 160);
            $table->string('brand', 120)->nullable();
            $table->string('model', 120)->nullable();
            $table->string('serial_number', 120)->nullable()->unique();
            $table->string('phone_number', 60)->nullable();
            $table->string('license_key', 255)->nullable();
            $table->date('license_expires_at')->nullable();
            $table->string('vendor_name', 160)->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 15, 2)->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->date('warranty_expires_at')->nullable();
            $table->date('maintenance_due_at')->nullable();
            $table->string('status', 40)->default('available');
            $table->string('qr_code_value', 120)->unique();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('it_asset_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('asset_id')->constrained('it_assets')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('returned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at');
            $table->date('expected_return_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->string('assignment_condition', 60)->nullable();
            $table->string('return_condition', 60)->nullable();
            $table->text('assignment_notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->string('status', 40)->default('active');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('it_asset_maintenances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('asset_id')->constrained('it_assets')->cascadeOnDelete();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('maintenance_type', 40)->default('preventive');
            $table->string('vendor_name', 160)->nullable();
            $table->date('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 40)->default('scheduled');
            $table->boolean('warranty_claim')->default(false);
            $table->decimal('cost_amount', 15, 2)->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->text('notes')->nullable();
            $table->text('resolution')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('it_asset_maintenances');
        Schema::dropIfExists('it_asset_assignments');
        Schema::dropIfExists('it_assets');
    }
};
