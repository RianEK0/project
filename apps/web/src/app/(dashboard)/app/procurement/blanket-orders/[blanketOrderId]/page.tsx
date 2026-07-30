import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type BlanketOrderDetailPageProps = {
  params: Promise<{
    blanketOrderId: string;
  }>;
};

export default async function BlanketOrderDetailPage({ params }: BlanketOrderDetailPageProps) {
  const { blanketOrderId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Blanket Order Detail"
      title={`Blanket Order ${blanketOrderId}`}
      description="Detail blanket order akan memusatkan release eligibility, coverage supplier, dan keterhubungan ke purchase order yang diturunkan."
      highlights={[
        `Blanket order ${blanketOrderId}`,
        'Release PO foundation',
        'Supplier repeat-buy coverage',
        'Agreement lifecycle visibility',
      ]}
      relatedLinks={[
        { href: '/app/procurement/blanket-orders', label: 'Blanket orders' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
