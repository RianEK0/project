import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

export default function BlanketOrdersPage() {
  return (
    <ProcurementPlaceholderPage
      eyebrow="Blanket Orders"
      title="Repeat-buy release agreement foundation"
      description="Blanket order foundation menyiapkan pembelian berulang yang nantinya bisa menghasilkan release PO tanpa harus memulai dari sourcing penuh."
      highlights={[
        'Repeat-buy procurement foundation',
        'Release source for downstream PO',
        'Active, paused, expired, and closed states',
        'Future contract-style purchase control',
      ]}
      relatedLinks={[
        { href: '/app/procurement/contracts', label: 'Purchase contracts' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
