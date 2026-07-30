import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function NewPurchaseOrderPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="New PO"
      title="Create a new purchase order"
      description="Form purchase order akan menyatukan supplier pemenang, terms utama, approval, dan strategi receive sebelum dokumen dikirim keluar."
      highlights={[
        'Direct or sourcing-derived PO creation',
        'Approval-aware commercial commitment',
        'Partial receive and invoice prep readiness',
        'Receipt linkage into goods receipt flow',
      ]}
      relatedLinks={[
        { href: '/app/procurement/orders', label: 'Purchase orders' },
        { href: '/app/procurement/blanket-orders', label: 'Blanket orders' },
      ]}
    />
  );
}
