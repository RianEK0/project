import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function PricingPage() {
  return (
    <SectionPlaceholder
      eyebrow="Pricing Engine"
      title="Price rules and promo logic"
      description="Pricing foundation sudah disiapkan untuk rule deterministik berbasis weekday, customer group, location, quantity, dan promo code, dengan total yang stabil di booking dan invoice."
      highlights={[
        'Rule priority ordering',
        'Percent and fixed adjustments',
        'Promotion scope by service and location',
        'Consistent subtotal-to-grand total flow',
      ]}
    />
  );
}
