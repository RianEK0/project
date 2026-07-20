<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('legal_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('website')->nullable();
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            $table->foreignId('head_employee_id')->nullable()->after('phone')->constrained('employees')->nullOnDelete();
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->foreignId('head_employee_id')->nullable()->after('cost_center')->constrained('employees')->nullOnDelete();
        });

        Schema::table('divisions', function (Blueprint $table) {
            $table->foreignId('head_employee_id')->nullable()->after('description')->constrained('employees')->nullOnDelete();
        });

        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->foreignId('head_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('division_id')->constrained('sections')->nullOnDelete();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('division_id')->constrained('sections')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });

        Schema::dropIfExists('sections');

        Schema::table('divisions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('head_employee_id');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('head_employee_id');
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('head_employee_id');
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::dropIfExists('companies');
    }
};
