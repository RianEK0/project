import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function PurchaseOrderDetailPage({ params }: PurchaseOrderDetailPageProps) {
  const { orderId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="PO Detail"
      title={`Purchase Order ${orderId}`}
      description="Detail PO akan menampilkan status approval, status receive, readiness invoice preparation, dan sisa backorder bila receive baru parsial."
      highlights={[
        `Purchase order ${orderId}`,
        'Receive and backorder visibility',
        'Invoice preparation checkpoint',
        'Supplier commitment history',
      ]}
      relatedLinks={[
        { href: '/app/procurement/orders', label: 'All purchase orders' },
        { href: '/app/procurement/receipts', label: 'Purchase receive' },
      ]}
    />
  );
}
