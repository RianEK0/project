import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function CustomersPage() {
  return (
    <SectionPlaceholder
      eyebrow="Customer Management"
      title="Customer and segment workspace"
      description="Sprint 2 menambahkan customer master yang tenant-aware dengan nomor pelanggan, group membership, catatan internal, dan kaitan langsung ke booking, invoice, dan payment record."
      highlights={[
        'Customer master profile',
        'VIP and corporate grouping',
        'Soft-delete friendly auditability',
        'Transaction-linked lifecycle data',
      ]}
    />
  );
}
