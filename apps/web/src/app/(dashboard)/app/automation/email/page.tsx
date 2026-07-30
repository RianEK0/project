import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function EmailAutomationPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Email"
      title="Deliver approval, reminder, digest, and escalation workflows through email"
      description="Email Automation foundation menyiapkan jalur template dan trigger untuk komunikasi workflow yang lebih formal, auditable, dan nyaman dipakai lintas departemen enterprise."
      highlights={[
        'Template family starter',
        'Approval and digest delivery',
        'Reminder email queue',
        'Escalation communication lane',
      ]}
      relatedLinks={[
        { href: '/app/automation/reminders', label: 'Automation reminders' },
        { href: '/app/automation/rules', label: 'Automation rules' },
        { href: '/app/automation/webhooks', label: 'Automation webhooks' },
      ]}
    />
  );
}
