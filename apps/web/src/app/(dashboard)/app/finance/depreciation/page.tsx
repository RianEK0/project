import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function DepreciationPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Depreciation"
      title="Preview schedule, posting readiness, and residual value control"
      description="Depreciation starter memusatkan metode, residual value, useful life, dan preview schedule agar expense recognition aset memiliki fondasi yang konsisten."
      highlights={[
        'Straight-line schedule preview',
        'Depreciation run status',
        'Residual and useful-life control',
        'Statement impact readiness',
      ]}
      relatedLinks={[
        { href: '/app/finance/assets', label: 'Fixed assets' },
        { href: '/app/finance/posting', label: 'Posting' },
        { href: '/app/finance/profit-loss', label: 'Profit loss' },
      ]}
    />
  );
}
