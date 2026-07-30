import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function NewPurchaseRequestPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="New Request"
      title="Create a procurement request"
      description="Form ini akan menangkap kebutuhan pembelian, alasan bisnis, supplier preference opsional, requested-by context, dan downstream sourcing intent sebelum approval."
      highlights={[
        'Employee and operational request capture',
        'Request source classification',
        'Approval-ready commercial context',
        'Starting point for RFQ or direct PO flow',
      ]}
      relatedLinks={[
        { href: '/app/procurement/requests', label: 'Request list' },
        { href: '/app/procurement/rfqs', label: 'RFQ workspace' },
      ]}
    />
  );
}
