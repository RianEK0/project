import { AutomationPlaceholderPage } from '@/features/automation/automation-placeholder-page';

export default function CronPage() {
  return (
    <AutomationPlaceholderPage
      eyebrow="Automation / Cron"
      title="Preview recurring schedules for digest, reconciliation, and follow-up jobs"
      description="Cron foundation memberi preview jadwal berulang untuk recurring automation seperti digest harian, reminder periodik, atau trigger sinkronisasi tanpa langsung membangun scheduler production lengkap."
      highlights={[
        'Hourly to monthly presets',
        'Custom minute interval preview',
        'Timezone readiness starter',
        'Recurring automation kickoff',
      ]}
      relatedLinks={[
        { href: '/app/automation/triggers', label: 'Automation triggers' },
        { href: '/app/automation/reminders', label: 'Automation reminders' },
        { href: '/app/automation/rules', label: 'Automation rules' },
      ]}
    />
  );
}
