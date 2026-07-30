import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function WarehouseReportsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Reports"
      title="Movement ledger and warehouse productivity catalog"
      description="Halaman report menjadi katalog awal untuk movement ledger, warehouse productivity, dan allocation performance report yang akan terus diperluas pada sprint selanjutnya."
      highlights={[
        'Append-only movement ledger export starter',
        'Warehouse productivity report catalog',
        'Allocation strategy performance visibility',
        'Foundation for analytics and operational governance',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/dashboard', label: 'Warehouse dashboard' },
        { href: '/app/warehouse-operations/movements', label: 'Movement engine' },
      ]}
    />
  );
}
