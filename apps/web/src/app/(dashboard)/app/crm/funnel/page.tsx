import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesFunnelPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Sales Funnel"
      title="Measure conversion from lead to win"
      description="Sales funnel starter akan membaca bottleneck antara lead, opportunity, quotation, negotiation, dan close."
      highlights={['Stage counts', 'Drop-off points', 'Conversion rate', 'Rep coaching']}
      relatedLinks={[
        { href: '/app/crm/pipeline', label: 'Pipeline' },
        { href: '/app/crm/dashboard', label: 'Dashboard' },
      ]}
    />
  );
}
