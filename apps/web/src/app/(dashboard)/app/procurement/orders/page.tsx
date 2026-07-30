import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseOrdersPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Orders"
      title="Supplier commitment and receive-to-close tracking"
      description="Purchase order menjadi komitmen formal ke supplier dan menjadi penghubung ke purchase receive, backorder, invoice preparation, dan close."
      highlights={[
        'Approval to send lifecycle',
        'Partial receive and backorder awareness',
        'Invoice preparation readiness',
        'Shared receipt handoff to warehouse inbound',
      ]}
      relatedLinks={[
        { href: '/app/procurement/orders/new', label: 'Create purchase order' },
        { href: '/app/procurement/receipts', label: 'Purchase receive' },
      ]}
    />
  );
}
