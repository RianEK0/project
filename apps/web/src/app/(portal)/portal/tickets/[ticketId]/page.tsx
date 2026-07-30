import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalTicketDetailPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Ticket Detail"
      title="Read conversation state, next action, and resolution progress"
      description="Detail ticket akan memperlihatkan status workflow, histori respon, dokumen pendukung, dan aksi berikutnya agar customer tahu kapan harus menunggu atau membalas."
      highlights={[
        'Status transition visibility',
        'Customer reply and agent response context',
        'Attachment and evidence trail',
        'Resolution and closure readiness',
      ]}
      relatedLinks={[
        { href: '/portal/tickets', label: 'Back to tickets' },
        { href: '/portal/notifications', label: 'Open notifications' },
        { href: '/portal/tracking', label: 'Open portal tracking' },
      ]}
    />
  );
}
