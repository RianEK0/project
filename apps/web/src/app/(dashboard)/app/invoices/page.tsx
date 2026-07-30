import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function InvoicesPage() {
  return (
    <SectionPlaceholder
      eyebrow="Billing"
      title="Invoice issuance and balance tracking"
      description="Modul invoice dasar Sprint 2 menghubungkan booking ke tagihan dengan nomor dokumen, item snapshot, paid total, balance due, dan status finansial yang bisa dipakai untuk workflow operasional."
      highlights={[
        'Invoice numbering strategy',
        'Snapshot line items',
        'Outstanding balance visibility',
        'Manual settlement readiness',
      ]}
    />
  );
}
