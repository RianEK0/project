import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

type MovementDetailPageProps = {
  params: Promise<{
    movementId: string;
  }>;
};

export default async function MovementDetailPage({ params }: MovementDetailPageProps) {
  const { movementId } = await params;

  return (
    <OperationPlaceholderPage
      eyebrow="Movement Detail"
      title={`Movement ${movementId}`}
      description="Detail movement akan menampilkan timeline status, alokasi, dampak ledger, reversal linkage, dan jejak approval untuk satu dokumen pergerakan stok."
      highlights={[
        `Movement reference ${movementId}`,
        'Timeline, allocations, and ledger tabs',
        'Immutable posting with reversal-only correction',
        'Tenant-safe warehouse and location traceability',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/movements', label: 'All movements' },
        { href: '/app/warehouse-operations/reports', label: 'Movement reports' },
      ]}
    />
  );
}
