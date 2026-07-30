import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function VendorLeadTimesPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Vendor Lead Times"
      title="Lead time history and trend monitoring"
      description="Lead time history membantu procurement membaca stabilitas pengiriman vendor dan memutuskan siapa yang paling aman untuk replenishment penting."
      highlights={[
        'Historical lead time read model',
        'Improving, stable, and worsening trend view',
        'Supplier reliability insight',
        'Replenishment planning support',
      ]}
      relatedLinks={[
        { href: '/app/procurement/vendors/performance', label: 'Vendor performance' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
