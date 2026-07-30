import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationTriggersPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Trigger"
      title="Capture document events, reminders, approvals, webhooks, and cron ticks"
      description="Trigger foundation memetakan event entry point untuk booking, procurement, sales, finance, HR, dan manufacturing agar automation bisa dimulai dari perubahan bisnis yang relevan."
      highlights={[
        'Document and status event starter',
        'Approval and reminder triggers',
        'Webhook receive hooks',
        'Cron-based recurring kickoff',
      ]}
      relatedLinks={[
        { href: '/app/automation/rules', label: 'Automation rules' },
        { href: '/app/automation/cron', label: 'Cron' },
        { href: '/app/automation/webhooks', label: 'Webhooks' },
      ]}
    />
  );
}
