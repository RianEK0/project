import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationRemindersPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Reminder"
      title="Schedule due-date, escalation, and follow-up reminders across delivery channels"
      description="Reminder foundation memusatkan pengingat operasional agar approval, collection, follow-up, dan exception workflow dapat menggunakan pola cadence yang konsisten."
      highlights={[
        'Before-due and overdue cadence',
        'Channel-aware reminder queue',
        'Escalation reminder support',
        'Operational status visibility',
      ]}
      relatedLinks={[
        { href: '/app/automation/email', label: 'Email automation' },
        { href: '/app/automation/whatsapp', label: 'WhatsApp automation' },
        { href: '/app/operations', label: 'Operations' },
      ]}
    />
  );
}
