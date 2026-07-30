import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesFollowUpsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Follow Up"
      title="Structure the next commercial move"
      description="Follow up route merangkum aksi berikutnya setelah call, email, quotation, atau meeting."
      highlights={['Next action', 'Due window', 'Owner', 'Linked customer']}
      relatedLinks={[
        { href: '/app/crm/reminders', label: 'Reminders' },
        { href: '/app/crm/meetings', label: 'Meetings' },
      ]}
    />
  );
}
