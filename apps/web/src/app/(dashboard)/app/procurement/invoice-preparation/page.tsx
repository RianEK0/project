import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseInvoicePreparationPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Invoice Preparation"
      title="Prepare procurement-side invoice readiness"
      description="Invoice preparation mengonsolidasikan receipt dan PO context sebelum journal, voucher, dan posting payable di workspace finance mengambil alih."
      highlights={[
        'Finance handoff invoice context',
        'Receipt-linked readiness checks',
        'Blocked and prepared states',
        'AP posting handoff readiness',
      ]}
      relatedLinks={[
        { href: '/app/procurement/orders', label: 'Purchase orders' },
        { href: '/app/invoices', label: 'Invoices' },
        { href: '/app/finance/posting', label: 'Finance posting' },
      ]}
    />
  );
}
