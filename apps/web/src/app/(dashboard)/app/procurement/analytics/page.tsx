import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseAnalyticsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Analytics"
      title="Procurement funnel and supplier insight dashboard"
      description="Purchase analytics menyatukan request funnel, sourcing funnel, purchase order lifecycle, receipt readiness, dan invoice preparation starter metrics."
      highlights={[
        'Request-to-order funnel starter',
        'Sourcing and quotation throughput',
        'Receive and invoice prep coverage',
        'Vendor insight tie-in for decision support',
      ]}
      relatedLinks={[
        { href: '/app/procurement/dashboard', label: 'Procurement dashboard' },
        { href: '/app/procurement/vendors/performance', label: 'Vendor performance' },
      ]}
    />
  );
}
