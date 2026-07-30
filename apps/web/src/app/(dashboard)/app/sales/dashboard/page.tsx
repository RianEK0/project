import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesDashboardPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Sales Dashboard"
      title="Read order-to-cash performance at a glance"
      description="Sales analytics starter akan menampilkan open order value, fill rate, invoice rate, return rate, dan collection signal."
      highlights={['Open order value', 'Fill rate', 'Collection rate', 'Return rate']}
      relatedLinks={[
        { href: '/app/sales/orders', label: 'Sales orders' },
        { href: '/app/sales/invoices', label: 'Sales invoices' },
        { href: '/app/sales/analytics', label: 'Sales analytics' },
      ]}
    />
  );
}
