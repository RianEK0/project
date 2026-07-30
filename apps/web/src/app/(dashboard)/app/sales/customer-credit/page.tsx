import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function CustomerCreditPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Customer Credit"
      title="Review customer exposure before approving orders"
      description="Customer credit foundation menghitung limit, exposure, overdue balance, dan kemampuan approve order baru."
      highlights={['Credit limit', 'Exposure', 'Overdue balance', 'Approval readiness']}
      relatedLinks={[
        { href: '/app/sales/orders', label: 'Sales orders' },
        { href: '/app/sales/installments', label: 'Installments' },
      ]}
    />
  );
}
