import { ProcurementPlaceholderPage } from '@/features/procurement/procurement-placeholder-page';

type PurchaseContractDetailPageProps = {
  params: Promise<{
    contractId: string;
  }>;
};

export default async function PurchaseContractDetailPage({
  params,
}: PurchaseContractDetailPageProps) {
  const { contractId } = await params;

  return (
    <ProcurementPlaceholderPage
      eyebrow="Contract Detail"
      title={`Purchase Contract ${contractId}`}
      description="Detail purchase contract akan menampilkan supplier commitment, masa berlaku, dan kemungkinan pemakaian untuk release order berikutnya."
      highlights={[
        `Purchase contract ${contractId}`,
        'Supplier agreement context',
        'Validity and lifecycle visibility',
        'Release-order foundation',
      ]}
      relatedLinks={[
        { href: '/app/procurement/contracts', label: 'Purchase contracts' },
        { href: '/app/procurement/orders', label: 'Purchase orders' },
      ]}
    />
  );
}
