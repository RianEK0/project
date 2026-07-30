import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesAnalyticsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Sales Analytics"
      title="Measure fill, invoice, return, and collection performance"
      description="Sales analytics starter membaca kesehatan order-to-cash sekaligus menyiapkan konteks untuk finance, posting, dan statement review."
      highlights={['Fill rate', 'Invoice rate', 'Return rate', 'Collection risk']}
      relatedLinks={[
        { href: '/app/sales/dashboard', label: 'Sales dashboard' },
        { href: '/app/sales/orders', label: 'Sales orders' },
        { href: '/app/sales/returns', label: 'Returns' },
      ]}
    />
  );
}
