import { FinancePlaceholderPage } from '@/features/finance/finance-placeholder-page';

export default function PostingPage() {
  return (
    <FinancePlaceholderPage
      eyebrow="Finance / Posting"
      title="Control posting batches, readiness, and reversal flow"
      description="Posting workspace mengelompokkan journal atau voucher yang siap diposting ke general ledger, termasuk readiness gate, failure visibility, dan reversal starter."
      highlights={[
        'Posting batch lifecycle',
        'Ready and failed state visibility',
        'Ledger handoff control',
        'Reversal and rerun starter',
      ]}
      relatedLinks={[
        { href: '/app/finance/journals', label: 'Journals' },
        { href: '/app/finance/general-ledger', label: 'General ledger' },
        { href: '/app/finance/financial-statements', label: 'Financial statements' },
      ]}
    />
  );
}
