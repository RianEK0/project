import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseReceiptsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Receive"
      title="Procurement handoff into shared goods receipt"
      description="Purchase receive menampilkan PO yang siap diterima dan menjembatani receipt procurement ke goods receipt serta warehouse inbound yang sudah ada."
      highlights={[
        'PO-to-goods-receipt orchestration',
        'Partial receive and backorder view',
        'Shared inbound warehouse execution',
        'Receipt state before invoice prep',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/receipts', label: 'Goods receipts' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
