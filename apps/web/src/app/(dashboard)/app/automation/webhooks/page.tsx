import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function AutomationWebhooksPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Webhook"
      title="Preview external handoff, auth modes, and retry policy for event delivery"
      description="Webhook foundation menyiapkan endpoint contract, auth mode, dan retry preview agar automation NovaERP dapat terhubung ke sistem eksternal tanpa mengunci desain integrasi terlalu dini."
      highlights={[
        'Webhook endpoint contract',
        'Linear and exponential retries',
        'Auth mode starter',
        'External event handoff pattern',
      ]}
      relatedLinks={[
        { href: '/app/automation/actions', label: 'Automation actions' },
        { href: '/app/automation/slack', label: 'Slack automation' },
        { href: '/app/automation/discord', label: 'Discord automation' },
      ]}
    />
  );
}
