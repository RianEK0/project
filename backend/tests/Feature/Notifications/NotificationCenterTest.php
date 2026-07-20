<?php

namespace Tests\Feature\Notifications;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_hr_manager_can_broadcast_notification_and_record_delivery_logs(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employee = User::query()->where('email', 'nadia.putri@enterprise-hris.local')->firstOrFail();

        $response = $this->postJson('/api/v1/notifications/broadcast', [
            'subject' => 'Policy update',
            'title' => 'Policy update for leave and attendance',
            'message' => 'Please review the updated approval SLA and attendance correction deadline before tomorrow morning.',
            'channels' => ['in_app', 'email', 'slack'],
            'user_ids' => [$employee->id],
            'role_names' => ['department-manager'],
            'action_url' => 'http://localhost:5173/leave',
            'action_label' => 'Open Leave Workspace',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $response
            ->assertCreated()
            ->assertJsonPath('data.recipients_count', 2)
            ->assertJsonPath('data.deliveries_count', 6);

        $this->assertDatabaseHas('notification_delivery_logs', [
            'channel' => 'in_app',
            'status' => 'delivered',
            'recipient_user_id' => $employee->id,
        ]);

        $this->assertDatabaseHas('notification_delivery_logs', [
            'channel' => 'slack',
            'status' => 'ready',
            'recipient_user_id' => $employee->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $employee->id,
            'type' => 'App\\Notifications\\Workspace\\WorkspaceBroadcastNotification',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'notification.broadcast.sent',
        ]);
    }

    public function test_employee_can_view_and_mark_own_inbox_notifications(): void
    {
        $this->seed(DatabaseSeeder::class);

        $inboxResponse = $this->getJson('/api/v1/notifications/inbox', $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $inboxResponse
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Payroll cutoff reminder')
            ->assertJsonPath('data.0.is_read', false);

        $notificationId = $inboxResponse->json('data.0.id');

        $markReadResponse = $this->postJson("/api/v1/notifications/inbox/{$notificationId}/read", [], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $markReadResponse
            ->assertOk()
            ->assertJsonPath('data.id', $notificationId)
            ->assertJsonPath('data.is_read', true);

        $markAllResponse = $this->postJson('/api/v1/notifications/inbox/read-all', [], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $markAllResponse
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'updated_count',
                ],
            ]);
    }

    public function test_user_without_manage_permission_cannot_broadcast_notifications(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employee = User::query()->where('email', 'nadia.putri@enterprise-hris.local')->firstOrFail();

        $this->postJson('/api/v1/notifications/broadcast', [
            'title' => 'Unauthorized notification',
            'message' => 'This should not be broadcast by a standard employee.',
            'channels' => ['in_app'],
            'user_ids' => [$employee->id],
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertForbidden();
    }
}
