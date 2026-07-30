import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseApprovalsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Approvals"
      title="Decision queue for request, comparison, and PO"
      description="Queue approval procurement menampung keputusan untuk purchase request, vendor comparison, dan purchase order sebelum komitmen pembelian dikirim keluar."
      highlights={[
        'Centralized approval lane',
        'Escalation and rejection paths',
        'Request, comparison, and PO coverage',
        'Clear pre-commitment governance',
      ]}
      relatedLinks={[
        { href: '/app/procurement/requests', label: 'Purchase requests' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
