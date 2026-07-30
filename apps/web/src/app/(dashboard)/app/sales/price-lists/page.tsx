import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function PriceListsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Price List"
      title="Coordinate selling prices by customer and channel"
      description="Price list foundation menyiapkan standard, customer-specific, channel, campaign, dan contract pricing."
      highlights={[
        'Price sources',
        'Activation status',
        'Customer-specific pricing',
        'Contract pricing',
      ]}
      relatedLinks={[
        { href: '/app/sales/discount-engine', label: 'Discount engine' },
        { href: '/app/pricing', label: 'Core pricing' },
      ]}
    />
  );
}
