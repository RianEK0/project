import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function DeliveryOrdersPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Delivery Order"
      title="Authorize warehouse fulfillment for customer orders"
      description="Delivery order foundation menyiapkan release, pick, pack, dispatch, dan delivery completion per sales order."
      highlights={['Release status', 'Pick readiness', 'Dispatch readiness', 'Delivery completion']}
      relatedLinks={[
        { href: '/app/warehouse-operations/dispatch', label: 'Warehouse dispatch' },
        { href: '/app/sales/shipments', label: 'Shipments' },
      ]}
    />
  );
}
