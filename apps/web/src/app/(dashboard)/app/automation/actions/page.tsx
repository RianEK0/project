import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationActionsPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Action"
      title="Queue approvals, reminders, webhook calls, and channel notifications"
      description="Action foundation menyiapkan efek utama automation seperti pembuatan approval, pengiriman reminder, panggilan webhook, dan notifikasi lintas channel sebelum worker orchestration production hadir."
      highlights={[
        'Action catalog starter',
        'Queued side-effect model',
        'Notification and webhook handoff',
        'Human approval loop support',
      ]}
      relatedLinks={[
        { href: '/app/automation/reminders', label: 'Automation reminders' },
        { href: '/app/automation/webhooks', label: 'Automation webhooks' },
        { href: '/app/automation/email', label: 'Email automation' },
      ]}
    />
  );
}
