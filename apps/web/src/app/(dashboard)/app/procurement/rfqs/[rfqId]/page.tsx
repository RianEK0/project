import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type RfqDetailPageProps = {
  params: Promise<{
    rfqId: string;
  }>;
};

export default async function RfqDetailPage({ params }: RfqDetailPageProps) {
  const { rfqId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="RFQ Detail"
      title={`RFQ ${rfqId}`}
      description="Detail RFQ akan memperlihatkan supplier yang diundang, quotation yang sudah masuk, status award, dan keputusan sourcing."
      highlights={[
        `RFQ ${rfqId}`,
        'Invited supplier coverage',
        'Quotation response progress',
        'Award and close checkpoints',
      ]}
      relatedLinks={[
        { href: '/app/procurement/rfqs', label: 'All RFQs' },
        { href: '/app/procurement/quotations', label: 'Supplier quotations' },
      ]}
    />
  );
}
