<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_channel_configs', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 40)->unique();
            $table->string('label', 120);
            $table->string('driver', 120);
            $table->string('transport_mode', 20)->default('live');
            $table->boolean('is_enabled')->default(true);
            $table->string('description')->nullable();
            $table->json('config')->nullable();
            $table->timestamp('last_tested_at')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('notification_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 40)->default('workspace');
            $table->string('channel', 40);
            $table->string('notification_type', 160);
            $table->string('subject', 160)->nullable();
            $table->string('title', 160)->nullable();
            $table->text('message')->nullable();
            $table->string('recipient', 255)->nullable();
            $table->string('status', 40)->default('delivered');
            $table->string('transport_mode', 20)->default('live');
            $table->uuid('notification_uuid')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['channel', 'status']);
            $table->index(['recipient_user_id', 'created_at']);
            $table->index(['notification_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_delivery_logs');
        Schema::dropIfExists('notification_channel_configs');
    }
};
