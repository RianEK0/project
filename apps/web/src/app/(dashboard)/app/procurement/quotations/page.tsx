import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function SupplierQuotationsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Supplier Quotations"
      title="Quoted price, lead time, and commercial terms"
      description="Daftar quotation mengumpulkan penawaran supplier yang nanti dinilai oleh vendor comparison sebelum dipilih buyer atau procurement manager."
      highlights={[
        'Commercial offer intake',
        'Quoted lead time and price capture',
        'Shortlist and award support',
        'Comparison input for sourcing decisions',
      ]}
      relatedLinks={[
        { href: '/app/procurement/rfqs', label: 'RFQ workspace' },
        { href: '/app/procurement/comparisons', label: 'Vendor comparisons' },
      ]}
    />
  );
}
