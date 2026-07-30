import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function StockCountsPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Stock Count"
      title="Count planning and variance control workspace"
      description="Halaman stock count akan memuat daftar full count, cycle count, dan spot count dengan kontrol freeze, variance review, approval, dan posting."
      highlights={[
        'Full, cycle, and spot count support',
        'Freeze-aware count execution windows',
        'Variance review before posting',
        'Adjustment linkage after count approval',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/stock-counts/new', label: 'Create stock count' },
        { href: '/app/warehouse-operations/reports', label: 'Count reporting' },
      ]}
    />
  );
}
