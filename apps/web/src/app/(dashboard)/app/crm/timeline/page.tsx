import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function CustomerTimelinePage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Customer Timeline"
      title="Unify communication and sales milestones"
      description="Customer timeline menyatukan event sales penting agar rep selalu punya konteks sebelum follow up berikutnya."
      highlights={['Event stream', 'Channel history', 'Recent milestones', 'Customer context']}
      relatedLinks={[
        { href: '/app/crm/email', label: 'Email history' },
        { href: '/app/crm/whatsapp', label: 'WhatsApp history' },
        { href: '/app/crm/activities', label: 'Activities' },
      ]}
    />
  );
}
