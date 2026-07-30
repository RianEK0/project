import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function DiscountEnginePage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Discount Engine"
      title="Evaluate commercial discount scenarios"
      description="Discount engine starter menghitung percentage, fixed amount, tiered, dan buy-x-get-y discount terhadap line atau order."
      highlights={['Rule types', 'Line discounts', 'Order discounts', 'Scenario preview']}
      relatedLinks={[
        { href: '/app/sales/price-lists', label: 'Price lists' },
        { href: '/app/sales/orders', label: 'Sales orders' },
      ]}
    />
  );
}
