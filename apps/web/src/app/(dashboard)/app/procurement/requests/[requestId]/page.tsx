import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function PurchaseRequestDetailPage({
  params,
}: PurchaseRequestDetailPageProps) {
  const { requestId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Request Detail"
      title={`Purchase Request ${requestId}`}
      description="Detail purchase request akan menampilkan approval trail, sourcing handoff, dan relasi ke RFQ atau PO yang dihasilkan."
      highlights={[
        `Purchase request ${requestId}`,
        'Approval and sourcing history',
        'Ordered versus remaining request view',
        'Links to RFQ and purchase order outcomes',
      ]}
      relatedLinks={[
        { href: '/app/procurement/requests', label: 'All requests' },
        { href: '/app/procurement/approvals', label: 'Approval queue' },
      ]}
    />
  );
}
