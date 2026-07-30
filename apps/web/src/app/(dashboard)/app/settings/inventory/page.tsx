import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function InventorySettingsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Inventory Settings"
      title="Govern stock rules before operational rollout"
      description="Halaman ini menyiapkan ruang untuk policy inventory seperti negative stock, opening balance governance, barcode defaults, warehouse preferences, dan alert thresholds sebelum workflow movement penuh masuk di sprint berikutnya."
      highlights={[
        'Organization inventory defaults',
        'Opening balance guardrails',
        'Barcode and SKU conventions',
        'Alert thresholds and diagnostics',
      ]}
      badgeLabel="Sprint 3A Foundation"
    />
  );
}
