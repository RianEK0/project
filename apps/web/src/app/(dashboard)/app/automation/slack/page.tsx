import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function SlackAutomationPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Slack"
      title="Route approval and exception signals into Slack channels or direct messages"
      description="Slack Automation foundation cocok untuk tim internal yang ingin menerima sinyal exception, approval, atau digest ke channel operasional tanpa menunggu notifikasi center lebih kompleks."
      highlights={[
        'Channel and DM delivery',
        'Approval relay preview',
        'Exception alert starter',
        'Internal collaboration handoff',
      ]}
      relatedLinks={[
        { href: '/app/automation/webhooks', label: 'Automation webhooks' },
        { href: '/app/automation/rules', label: 'Automation rules' },
        { href: '/app/automation/approval-flows', label: 'Approval flow' },
      ]}
    />
  );
}
