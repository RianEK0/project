<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            $table->boolean('deducts_balance')->default(true)->after('default_days');
            $table->boolean('count_weekends')->default(false)->after('deducts_balance');
            $table->boolean('count_holidays')->default(false)->after('count_weekends');
            $table->string('color', 40)->nullable()->after('count_holidays');
        });

        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->decimal('allocated_days', 8, 2)->default(0);
            $table->decimal('carried_over_days', 8, 2)->default(0);
            $table->decimal('used_days', 8, 2)->default(0);
            $table->decimal('pending_days', 8, 2)->default(0);
            $table->decimal('adjustment_days', 8, 2)->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'leave_type_id', 'year']);
            $table->index(['employee_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_balances');

        Schema::table('leave_types', function (Blueprint $table) {
            $table->dropColumn([
                'deducts_balance',
                'count_weekends',
                'count_holidays',
                'color',
            ]);
        });
    }
};
