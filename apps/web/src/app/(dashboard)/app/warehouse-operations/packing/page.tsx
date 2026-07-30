import { OperationPlaceholderPage } from '@/features/warehouse-operations/operation-placeholder-page';

export default function PackingPage() {
  return (
    <OperationPlaceholderPage
      eyebrow="Packing"
      title="Basic packing session workspace"
      description="Halaman packing menyiapkan sesi pengepakan dasar sesudah picking untuk goods issue atau stock transfer sebelum dispatch dilakukan."
      highlights={[
        'Packing session lifecycle from draft to packed',
        'Package count and weight foundation',
        'Lot, serial, and package grouping',
        'Dispatch-ready staging context',
      ]}
      relatedLinks={[
        { href: '/app/warehouse-operations/dispatch', label: 'Dispatch board' },
        { href: '/app/warehouse-operations/issues', label: 'Goods issues' },
      ]}
    />
  );
}
