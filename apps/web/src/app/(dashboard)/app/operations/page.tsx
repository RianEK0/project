import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function OperationsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Execution"
      title="Check-in, check-out, and reminders"
      description="Layer operasional Sprint 2 mengikat booking ke real execution flow: reminder terjadwal, check-in, in-progress handling, sampai check-out dan penutupan layanan."
      highlights={[
        'Check-in rule enforcement',
        'Check-out completion flow',
        'Reminder queue placeholders',
        'Operational auditability',
      ]}
    />
  );
}
