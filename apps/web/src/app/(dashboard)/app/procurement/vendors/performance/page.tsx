import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function VendorPerformancePage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Vendor Performance"
      title="Vendor rating, service quality, and delivery confidence"
      description="View ini akan menampilkan rating vendor, on-time rate, acceptance rate, dan lead time trend dari aktivitas procurement dan receipt."
      highlights={[
        'Vendor rating and watchlist signals',
        'Lead time trend and on-time performance',
        'Receipt quality and acceptance view',
        'Input for sourcing and repeat-buy decisions',
      ]}
      relatedLinks={[
        { href: '/app/procurement/vendors/price-history', label: 'Vendor price history' },
        { href: '/app/procurement/vendors/lead-times', label: 'Vendor lead times' },
      ]}
    />
  );
}
