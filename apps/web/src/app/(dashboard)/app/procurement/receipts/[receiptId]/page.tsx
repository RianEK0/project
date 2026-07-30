import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseReceiptDetailPageProps = {
  params: Promise<{
    receiptId: string;
  }>;
};

export default async function PurchaseReceiptDetailPage({
  params,
}: PurchaseReceiptDetailPageProps) {
  const { receiptId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Receipt Detail"
      title={`Purchase Receipt ${receiptId}`}
      description="Detail purchase receipt akan menampilkan PO asal, receive progress, backorder sisa, dan tautan ke goods receipt yang menangani receipt fisik."
      highlights={[
        `Purchase receipt ${receiptId}`,
        'PO linkage and receive progress',
        'Backorder visibility',
        'Shared goods receipt execution',
      ]}
      relatedLinks={[
        { href: '/app/procurement/receipts', label: 'Purchase receive' },
        { href: '/app/warehouse-operations/receipts', label: 'Goods receipts' },
      ]}
    />
  );
}
