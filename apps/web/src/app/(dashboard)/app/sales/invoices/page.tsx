import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function SalesInvoicesPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Sales Invoice"
      title="Orchestrate billing after fulfillment milestones"
      description="Sales invoice foundation menjembatani sales order dan invoice engine yang sudah ada untuk issue, overdue, dan collection visibility."
      highlights={['Invoice readiness', 'Issue status', 'Overdue watch', 'Collection signal']}
      relatedLinks={[
        { href: '/app/invoices', label: 'Core invoices' },
        { href: '/app/sales/installments', label: 'Installments' },
      ]}
    />
  );
}
