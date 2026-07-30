import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesReturnsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Return"
      title="Handle customer returns with clear recovery flow"
      description="Sales return foundation mencatat request, inbound receipt, inspection, refund, dan credit issuance sebelum close."
      highlights={['Return request', 'Inbound receipt', 'Inspection result', 'Credit readiness']}
      relatedLinks={[
        { href: '/app/sales/credit-notes', label: 'Credit notes' },
        { href: '/app/warehouse-operations/receipts', label: 'Warehouse receipts' },
      ]}
    />
  );
}
