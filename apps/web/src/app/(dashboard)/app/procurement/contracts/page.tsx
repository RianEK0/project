import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function PurchaseContractsPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Purchase Contracts"
      title="Commercial agreement foundation for future releases"
      description="Purchase contract foundation mencatat agreement procurement yang nantinya dapat menghasilkan PO release dan supplier control lebih lanjut."
      highlights={[
        'Agreement lifecycle starter',
        'Future release and compliance anchor',
        'Commercial governance before accounting',
        'Shared supplier context with sourcing flow',
      ]}
      relatedLinks={[
        { href: '/app/procurement/blanket-orders', label: 'Blanket orders' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
