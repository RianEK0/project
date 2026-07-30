import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function RfqsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="RFQ"
      title="Request for quotation sourcing workspace"
      description="RFQ menampung sourcing round ke supplier setelah purchase request disetujui dan membutuhkan pembandingan penawaran formal."
      highlights={[
        'Supplier outreach per sourcing round',
        'Quotation collection readiness',
        'Closure and award checkpoints',
        'Request-to-sourcing handoff',
      ]}
      relatedLinks={[
        { href: '/app/procurement/rfqs/new', label: 'Create RFQ' },
        { href: '/app/procurement/quotations', label: 'Supplier quotations' },
      ]}
    />
  );
}
