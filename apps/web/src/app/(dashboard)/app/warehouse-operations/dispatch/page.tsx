import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function DispatchPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Dispatch"
      title="Dispatch record and outbound release board"
      description="Route dispatch mengikat kesiapan outbound akhir termasuk carrier, vehicle, driver, tracking, dan penanda stok benar-benar keluar dari warehouse."
      highlights={[
        'Ready, dispatched, and cancelled states',
        'Carrier and vehicle dispatch context',
        'Final outbound checkpoint before ledger close',
        'Linkage from packing and transfer shipment',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/packing', label: 'Packing sessions' },
        { href: '/app/warehouse-operations/issues', label: 'Goods issues' },
      ]}
    />
  );
}
