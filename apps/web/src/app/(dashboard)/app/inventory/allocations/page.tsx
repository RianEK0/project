import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function InventoryAllocationsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Inventory Allocations"
      title="Allocation workspace for FIFO, FEFO, and manual picks"
      description="Route inventory allocations menampung preview strategi, hasil alokasi, release flow, dan fulfillment tracking untuk outbound maupun internal transfer demand."
      highlights={[
        'FIFO, FEFO, manual, and system default strategy support',
        'Allocatable stock filters for expired, blocked, and quarantine stock',
        'Release and fulfillment lifecycle',
        'Reservation-aligned outbound planning',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/issues', label: 'Goods issues' },
        { href: '/app/warehouse-operations/transfers', label: 'Stock transfers' },
      ]}
    />
  );
}
