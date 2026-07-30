import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseRequestsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Requests"
      title="Employee and replenishment demand intake"
      description="Daftar purchase request menampung permintaan pembelian dari employee, replenishment trigger, maintenance, capex, atau kebutuhan proyek sebelum sourcing dimulai."
      highlights={[
        'Request lifecycle from draft to ordered',
        'Approval-aware procurement intake',
        'Replenishment and manual demand support',
        'Audit trail before sourcing starts',
      ]}
      relatedLinks={[
        { href: '/app/procurement/requests/new', label: 'Create request' },
        { href: '/app/procurement/approvals', label: 'Approval queue' },
      ]}
    />
  );
}
