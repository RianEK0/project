import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type CustomerCreditDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerCreditDetailPage({ params }: CustomerCreditDetailPageProps) {
  const { customerId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Customer Credit Detail"
      title={`Customer Credit ${customerId}`}
      description="Detail credit customer akan menunjukkan limit utilization, open orders, open invoices, dan keputusan release order."
      highlights={['Utilization', 'Open orders', 'Open invoices', 'Release decision']}
      relatedLinks={[
        { href: '/app/customers', label: 'Customers' },
        { href: '/app/sales/orders', label: 'Sales orders' },
      ]}
    />
  );
}
