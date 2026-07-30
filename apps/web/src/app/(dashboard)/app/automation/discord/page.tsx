import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function DiscordAutomationPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Discord"
      title="Prepare workflow delivery patterns for Discord-based team collaboration"
      description="Discord Automation foundation menjaga opsi integrasi komunitas atau tim operasional tertentu yang membutuhkan delivery workflow lewat channel, mention, atau escalation alert Discord."
      highlights={[
        'Channel message starter',
        'Role mention delivery pattern',
        'Escalation-ready alerts',
        'Community workflow bridge',
      ]}
      relatedLinks={[
        { href: '/app/automation/webhooks', label: 'Automation webhooks' },
        { href: '/app/automation/actions', label: 'Automation actions' },
        { href: '/app/automation/cron', label: 'Cron' },
      ]}
    />
  );
}
