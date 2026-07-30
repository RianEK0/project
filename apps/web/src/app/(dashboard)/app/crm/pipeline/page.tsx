import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesPipelinePage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Pipeline"
      title="Watch weighted revenue potential"
      description="Pipeline foundation membaca open count, open value, weighted value, dan stalled stage per jalur sales."
      highlights={['Weighted value', 'Open count', 'Stage mix', 'Stalled stage']}
      relatedLinks={[
        { href: '/app/crm/funnel', label: 'Sales funnel' },
        { href: '/app/crm/dashboard', label: 'Dashboard' },
      ]}
    />
  );
}
