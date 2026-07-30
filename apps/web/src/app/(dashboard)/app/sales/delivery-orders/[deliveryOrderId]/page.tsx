import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type DeliveryOrderDetailPageProps = {
  params: Promise<{
    deliveryOrderId: string;
  }>;
};

export default async function DeliveryOrderDetailPage({ params }: DeliveryOrderDetailPageProps) {
  const { deliveryOrderId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Delivery Order Detail"
      title={`Delivery Order ${deliveryOrderId}`}
      description="Detail delivery order akan memperlihatkan pick, pack, dispatch, delivery proof, dan sales order linkage."
      highlights={['Pick status', 'Pack status', 'Dispatch proof', 'Order linkage']}
      relatedLinks={[
        { href: '/app/sales/orders', label: 'Sales orders' },
        { href: '/app/sales/shipments', label: 'Shipments' },
      ]}
    />
  );
}
