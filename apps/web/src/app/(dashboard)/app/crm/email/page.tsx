import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesEmailPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Email"
      title="Track commercial email outreach"
      description="Email route ini menyiapkan daftar outbound dan follow up email sebelum send engine production hadir."
      highlights={['Draft status', 'Send status', 'Thread context', 'Customer visibility']}
      relatedLinks={[
        { href: '/app/crm/activities', label: 'Activity feed' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
