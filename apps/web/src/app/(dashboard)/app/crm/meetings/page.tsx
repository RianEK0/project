import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesMeetingsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Meeting"
      title="Coordinate discovery and negotiation meetings"
      description="Meeting foundation menyiapkan jadwal, status kehadiran, dan tujuan diskusi untuk jalur sales."
      highlights={['Meeting schedule', 'Attendance status', 'Agenda', 'Outcome notes']}
      relatedLinks={[
        { href: '/app/crm/timeline', label: 'Timeline' },
        { href: '/app/crm/follow-ups', label: 'Follow ups' },
      ]}
    />
  );
}
