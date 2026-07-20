<?php

namespace Database\Seeders\Notifications;

use App\Models\User;
use App\Notifications\Workspace\WorkspaceBroadcastNotification;
use Illuminate\Database\Seeder;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationChannelConfig;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationDeliveryLog;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@enterprise-hris.local')->first();
        $hrManager = User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->first();
        $manager = User::query()->where('email', 'alya.pratama@enterprise-hris.local')->first();
        $employee = User::query()->where('email', 'nadia.putri@enterprise-hris.local')->first();
        $itSupport = User::query()->where('email', 'nara.support@enterprise-hris.local')->first();

        if (! $admin || ! $hrManager || ! $manager || ! $employee || ! $itSupport) {
            return;
        }

        $channels = [
            [
                'channel' => 'in_app',
                'label' => 'In App',
                'driver' => 'database',
                'transport_mode' => 'live',
                'is_enabled' => true,
                'description' => 'Internal database-backed notification center for every signed-in user.',
                'config' => [
                    'credentials_configured' => true,
                    'default_target' => 'notification_center',
                    'notes' => 'Live channel for unread inbox and action routing.',
                ],
            ],
            [
                'channel' => 'email',
                'label' => 'Email',
                'driver' => 'smtp',
                'transport_mode' => 'live',
                'is_enabled' => true,
                'description' => 'Transactional email delivery for alerts, approvals, and security events.',
                'config' => [
                    'credentials_configured' => true,
                    'default_target' => 'user_email',
                    'notes' => 'Live transport uses the Laravel mailer configuration.',
                ],
            ],
            [
                'channel' => 'push',
                'label' => 'Push Notification',
                'driver' => 'web_push',
                'transport_mode' => 'ready',
                'is_enabled' => true,
                'description' => 'Prepared for browser or mobile push once device tokens and keys are connected.',
                'config' => [
                    'credentials_configured' => false,
                    'default_target' => 'device_subscription',
                    'notes' => 'Ready contract: attach service worker and VAPID keys to activate outbound push.',
                ],
            ],
            [
                'channel' => 'whatsapp',
                'label' => 'WhatsApp Ready',
                'driver' => 'meta_whatsapp_cloud',
                'transport_mode' => 'ready',
                'is_enabled' => true,
                'description' => 'Prepared for WhatsApp business workflow once provider credentials are supplied.',
                'config' => [
                    'credentials_configured' => false,
                    'default_target' => 'employee_phone',
                    'notes' => 'Ready contract: token, phone number ID, and approved template IDs are still required.',
                ],
            ],
            [
                'channel' => 'slack',
                'label' => 'Slack Ready',
                'driver' => 'slack_webhook',
                'transport_mode' => 'ready',
                'is_enabled' => true,
                'description' => 'Prepared for Slack broadcast and escalation workflows.',
                'config' => [
                    'credentials_configured' => false,
                    'default_target' => '#people-ops',
                    'notes' => 'Ready contract: incoming webhook and channel mapping can be added from this config row.',
                ],
            ],
            [
                'channel' => 'microsoft_teams',
                'label' => 'Microsoft Teams Ready',
                'driver' => 'teams_webhook',
                'transport_mode' => 'ready',
                'is_enabled' => true,
                'description' => 'Prepared for Microsoft Teams card delivery and operational routing.',
                'config' => [
                    'credentials_configured' => false,
                    'default_target' => 'HR Operations',
                    'notes' => 'Ready contract: webhook URL and adaptive card mapping are still pending.',
                ],
            ],
        ];

        foreach ($channels as $channel) {
            NotificationChannelConfig::query()->updateOrCreate(
                ['channel' => $channel['channel']],
                $channel + [
                    'updated_by' => $itSupport->id,
                    'last_tested_at' => now()->subHours(2),
                ],
            );
        }

        $employeeNotification = new WorkspaceBroadcastNotification([
            'channels' => ['in_app'],
            'title' => 'Payroll cutoff reminder',
            'subject' => 'Payroll cutoff reminder',
            'message' => 'Submit any attendance correction before the payroll cutoff window closes tomorrow at 17:00.',
            'action_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/').'/attendance',
            'action_label' => 'Open Attendance',
            'source' => 'seed',
            'sender' => [
                'id' => $hrManager->id,
                'name' => $hrManager->name,
                'email' => $hrManager->email,
            ],
        ]);

        $employee->notify($employeeNotification);
        $employee->notifications()->where('id', $employeeNotification->id)->update([
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHours(6),
        ]);

        $managerNotification = new WorkspaceBroadcastNotification([
            'channels' => ['in_app'],
            'title' => 'Interview panel reminder',
            'subject' => 'Interview panel reminder',
            'message' => 'Backend technical panel interviews start tomorrow at 10:00 and the recruitment workspace already contains the latest candidate pack.',
            'action_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/').'/recruitment',
            'action_label' => 'Open Recruitment',
            'source' => 'seed',
            'sender' => [
                'id' => $hrManager->id,
                'name' => $hrManager->name,
                'email' => $hrManager->email,
            ],
        ]);

        $manager->notify($managerNotification);
        $manager->notifications()->where('id', $managerNotification->id)->update([
            'read_at' => now()->subHours(3),
            'created_at' => now()->subHours(5),
            'updated_at' => now()->subHours(3),
        ]);

        $logs = [
            [
                'recipient_user_id' => $employee->id,
                'sent_by' => $hrManager->id,
                'source' => 'seed',
                'channel' => 'in_app',
                'notification_type' => WorkspaceBroadcastNotification::class,
                'subject' => 'Payroll cutoff reminder',
                'title' => 'Payroll cutoff reminder',
                'message' => 'Submit any attendance correction before the payroll cutoff window closes tomorrow at 17:00.',
                'recipient' => $employee->name,
                'status' => 'delivered',
                'transport_mode' => 'live',
                'notification_uuid' => $employeeNotification->id,
                'payload' => [
                    'note' => 'Seeded in-app notification delivered successfully.',
                ],
                'sent_at' => now()->subHours(6),
            ],
            [
                'recipient_user_id' => $manager->id,
                'sent_by' => $hrManager->id,
                'source' => 'seed',
                'channel' => 'email',
                'notification_type' => WorkspaceBroadcastNotification::class,
                'subject' => 'Interview panel reminder',
                'title' => 'Interview panel reminder',
                'message' => 'Backend technical panel interviews start tomorrow at 10:00 and the recruitment workspace already contains the latest candidate pack.',
                'recipient' => $manager->email,
                'status' => 'delivered',
                'transport_mode' => 'live',
                'notification_uuid' => $managerNotification->id,
                'payload' => [
                    'note' => 'Seeded email delivery recorded as successful.',
                ],
                'sent_at' => now()->subHours(5),
            ],
            [
                'recipient_user_id' => $admin->id,
                'sent_by' => $itSupport->id,
                'source' => 'seed',
                'channel' => 'slack',
                'notification_type' => WorkspaceBroadcastNotification::class,
                'subject' => 'Connector warmup',
                'title' => 'Connector warmup',
                'message' => 'Slack connector contract is present and waiting for webhook activation.',
                'recipient' => '#people-ops',
                'status' => 'ready',
                'transport_mode' => 'ready',
                'notification_uuid' => null,
                'payload' => [
                    'note' => 'Seeded ready-state delivery log for external connector handoff.',
                ],
                'sent_at' => now()->subHours(4),
            ],
        ];

        foreach ($logs as $log) {
            NotificationDeliveryLog::query()->updateOrCreate(
                [
                    'channel' => $log['channel'],
                    'recipient_user_id' => $log['recipient_user_id'],
                    'subject' => $log['subject'],
                ],
                $log,
            );
        }
    }
}
