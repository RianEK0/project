import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesOrdersPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Sales Order"
      title="Commit commercial demand into executable orders"
      description="Sales order foundation menyiapkan approval, allocation, delivery, invoicing, dan close orchestration dari quotation atau direct demand."
      highlights={['Approval flow', 'Allocation status', 'Delivery readiness', 'Invoice readiness']}
      relatedLinks={[
        { href: '/app/sales/orders/new', label: 'Create sales order' },
        { href: '/app/sales/delivery-orders', label: 'Delivery orders' },
        { href: '/app/sales/invoices', label: 'Sales invoices' },
      ]}
    />
  );
}
