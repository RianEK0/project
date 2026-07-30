import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function NewRfqPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="New RFQ"
      title="Start a new sourcing round"
      description="Form RFQ akan menautkan purchase request, supplier shortlist, item scope, timeline respons, dan alasan sourcing sebelum quotation masuk."
      highlights={[
        'Request-linked sourcing bundle',
        'Supplier shortlist setup',
        'Response timeline foundation',
        'Comparison-ready quotation intake',
      ]}
      relatedLinks={[
        { href: '/app/procurement/rfqs', label: 'RFQ list' },
        { href: '/app/procurement/comparisons', label: 'Vendor comparisons' },
      ]}
    />
  );
}
