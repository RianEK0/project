import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function CostCentersPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Cost Center"
      title="Organize reporting responsibility across teams and departments"
      description="Cost center foundation membantu finance memetakan tanggung jawab biaya, anggaran, dan asset ownership ke struktur organisasi yang lebih bermakna."
      highlights={[
        'Hierarchy by division and department',
        'Budget responsibility mapping',
        'Asset and expense attribution',
        'Statement drill-through starter',
      ]}
      relatedLinks={[
        { href: '/app/finance/budgets', label: 'Budgets' },
        { href: '/app/finance/assets', label: 'Assets' },
        { href: '/app/finance/general-ledger', label: 'General ledger' },
      ]}
    />
  );
}
