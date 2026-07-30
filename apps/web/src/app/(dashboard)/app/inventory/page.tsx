import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function InventoryPage() {
  return (
    <SectionPlaceholder
      eyebrow="Inventory Foundation"
      title="Balances, reservations, lots, and serial readiness"
      description="Sprint 3A menyiapkan fondasi stok dengan balance read model, reservation flow, lot and serial tracking, opening balance, alert, dan ledger dasar supaya workflow inventory berikutnya bisa dibangun secara aman."
      highlights={[
        'Fast balance snapshots per location',
        'Reservation and release workflow',
        'Lot expiration and serial traceability',
        'Opening balance and alert scaffolding',
      ]}
      badgeLabel="Sprint 3A Foundation"
    />
  );
}
