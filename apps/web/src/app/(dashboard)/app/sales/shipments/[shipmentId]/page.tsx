import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type ShipmentDetailPageProps = {
  params: Promise<{
    shipmentId: string;
  }>;
};

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { shipmentId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Shipment Detail"
      title={`Shipment ${shipmentId}`}
      description="Detail shipment akan menyimpan bukti serah, exception handling, dan outcome akhir ke delivered atau returned."
      highlights={['Carrier handoff', 'Transit events', 'Proof of delivery', 'Exception outcome']}
      relatedLinks={[
        { href: '/app/sales/returns', label: 'Returns' },
        { href: '/app/sales/analytics', label: 'Sales analytics' },
      ]}
    />
  );
}
