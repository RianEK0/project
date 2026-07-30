import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type GoodsReceiptDetailPageProps = {
  params: Promise<{
    receiptId: string;
  }>;
};

export default async function GoodsReceiptDetailPage({ params }: GoodsReceiptDetailPageProps) {
  const { receiptId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Receipt Detail"
      title={`Receipt ${receiptId}`}
      description="Detail receipt akan memperlihatkan item line, hasil inspection, label output, ledger receipt, dan tautan ke tugas putaway setelah barang lolos proses receiving."
      highlights={[
        `Receipt reference ${receiptId}`,
        'Inspection outcome and accepted quantity',
        'Receiving labels and lot or serial evidence',
        'Putaway handoff after inbound posting',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/receipts', label: 'All receipts' },
        { href: '/app/warehouse-operations/putaway', label: 'Putaway tasks' },
      ]}
    />
  );
}
