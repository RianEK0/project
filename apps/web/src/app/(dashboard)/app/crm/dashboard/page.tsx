import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesDashboardPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Sales Dashboard"
      title="Watch the commercial engine at a glance"
      description="Sales dashboard starter akan menampilkan lead creation, active opportunities, open quotations, dan weighted pipeline."
      highlights={['Lead inflow', 'Open opportunities', 'Open quotations', 'Weighted pipeline']}
      relatedLinks={[
        { href: '/app/crm/funnel', label: 'Sales funnel' },
        { href: '/app/crm/pipeline', label: 'Pipeline' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
