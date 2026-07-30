import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function ProductsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Product Catalog"
      title="Products, variants, and barcode foundations"
      description="Sprint 3A memperluas NovaERP ke katalog produk universal dengan kategori, brand, atribut, variant stock unit, supplier link, dan barcode yang siap dipakai lintas retail, warehouse, maupun operasional booking."
      highlights={[
        'Product and category hierarchy',
        'Variant SKU and attribute matrix',
        'Supplier and sourcing links',
        'Barcode and import/export readiness',
      ]}
      badgeLabel="Sprint 3A Foundation"
    />
  );
}
