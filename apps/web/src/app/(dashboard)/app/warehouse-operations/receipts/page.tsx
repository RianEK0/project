import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function GoodsReceiptsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Goods Receipt"
      title="Inbound receiving and inspection workspace"
      description="Route ini menampung daftar goods receipt untuk sumber manual, opening correction, placeholder purchase order, customer return placeholder, transfer receipt, dan sumber inbound lain yang diizinkan Sprint 3B."
      highlights={[
        'Expected, arrived, receiving, inspected, and posted states',
        'Receiving location control before putaway',
        'Lot, serial, and expiration capture',
        'Inspection split for accepted, rejected, and quarantine stock',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/receipts/new', label: 'Create receipt' },
        { href: '/app/warehouse-operations/putaway', label: 'Open putaway queue' },
      ]}
    />
  );
}
