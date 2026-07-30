import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function DealsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Deal"
      title="Track negotiation and close outcome"
      description="Deal foundation memisahkan komitmen komersial dari lead dan opportunity agar win/loss reasoning lebih jelas."
      highlights={['Negotiation state', 'Commercial blockers', 'Win/loss outcome', 'Close notes']}
      relatedLinks={[
        { href: '/app/crm/pipeline', label: 'Pipeline overview' },
        { href: '/app/crm/dashboard', label: 'Sales dashboard' },
      ]}
    />
  );
}
