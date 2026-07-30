import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type SupplierQuotationDetailPageProps = {
  params: Promise<{
    quotationId: string;
  }>;
};

export default async function SupplierQuotationDetailPage({
  params,
}: SupplierQuotationDetailPageProps) {
  const { quotationId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Quotation Detail"
      title={`Quotation ${quotationId}`}
      description="Detail quotation akan memusatkan harga, lead time, syarat komersial, dan posisi quotation itu dalam proses shortlist serta award."
      highlights={[
        `Supplier quotation ${quotationId}`,
        'Commercial and lead-time detail',
        'Shortlist and award context',
        'Comparison input readiness',
      ]}
      relatedLinks={[
        { href: '/app/procurement/quotations', label: 'All quotations' },
        { href: '/app/procurement/comparisons', label: 'Vendor comparisons' },
      ]}
    />
  );
}
