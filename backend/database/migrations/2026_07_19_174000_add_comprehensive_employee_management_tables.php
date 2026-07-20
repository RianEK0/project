<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('grade', 50)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('middle_name', 100)->nullable()->after('first_name');
            $table->string('preferred_name', 100)->nullable()->after('last_name');
            $table->string('gender', 30)->nullable()->after('phone');
            $table->string('marital_status', 30)->nullable()->after('gender');
            $table->string('place_of_birth', 150)->nullable()->after('marital_status');
            $table->text('address')->nullable()->after('place_of_birth');
            $table->string('city', 120)->nullable()->after('address');
            $table->string('state', 120)->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('state');
            $table->string('country', 120)->nullable()->after('postal_code');
            $table->string('photo_path')->nullable()->after('country');
            $table->string('identity_card_number', 100)->nullable()->after('photo_path');
            $table->string('passport_number', 100)->nullable()->after('identity_card_number');
            $table->date('passport_expiry_date')->nullable()->after('passport_number');
            $table->string('npwp_number', 100)->nullable()->after('passport_expiry_date');
            $table->string('bpjs_health_number', 100)->nullable()->after('npwp_number');
            $table->string('bpjs_employment_number', 100)->nullable()->after('bpjs_health_number');
            $table->foreignId('branch_id')->nullable()->after('department_id')->constrained('branches')->nullOnDelete();
            $table->foreignId('division_id')->nullable()->after('team_id')->constrained('divisions')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->after('division_id')->constrained('positions')->nullOnDelete();
            $table->json('family')->nullable()->after('meta');
            $table->json('emergency_contacts')->nullable()->after('family');
            $table->json('educations')->nullable()->after('emergency_contacts');
            $table->json('experiences')->nullable()->after('educations');
            $table->json('skills')->nullable()->after('experiences');
            $table->json('certifications')->nullable()->after('skills');
            $table->json('bank_accounts')->nullable()->after('certifications');
        });

        Schema::create('employee_salary_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('component', 120);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('IDR');
            $table->string('pay_frequency', 30)->default('monthly');
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(true);
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'effective_date']);
        });

        Schema::create('employee_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('contract_type', 60);
            $table->string('contract_number', 120)->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('status', 30)->default('active');
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'start_date']);
        });

        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 60);
            $table->string('label', 150);
            $table->string('disk', 30)->default('public');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('employee_contracts');
        Schema::dropIfExists('employee_salary_histories');

        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('position_id');
            $table->dropConstrainedForeignId('division_id');
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn([
                'middle_name',
                'preferred_name',
                'gender',
                'marital_status',
                'place_of_birth',
                'address',
                'city',
                'state',
                'postal_code',
                'country',
                'photo_path',
                'identity_card_number',
                'passport_number',
                'passport_expiry_date',
                'npwp_number',
                'bpjs_health_number',
                'bpjs_employment_number',
                'family',
                'emergency_contacts',
                'educations',
                'experiences',
                'skills',
                'certifications',
                'bank_accounts',
            ]);
        });

        Schema::dropIfExists('positions');
        Schema::dropIfExists('divisions');
        Schema::dropIfExists('branches');
    }
};
