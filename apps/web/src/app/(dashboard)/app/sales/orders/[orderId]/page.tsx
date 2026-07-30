import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type SalesOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function SalesOrderDetailPage({ params }: SalesOrderDetailPageProps) {
  const { orderId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Sales Order Detail"
      title={`Sales Order ${orderId}`}
      description="Detail sales order akan memperlihatkan status approval, fulfillment, invoicing, return exposure, dan nilai komersial."
      highlights={['Approval state', 'Fulfillment state', 'Invoice state', 'Return exposure']}
      relatedLinks={[
        { href: '/app/sales/delivery-orders', label: 'Delivery orders' },
        { href: '/app/sales/shipments', label: 'Shipments' },
      ]}
    />
  );
}
