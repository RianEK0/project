import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesWhatsappPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="WhatsApp"
      title="Prepare conversational sales follow through"
      description="WhatsApp foundation menyiapkan log channel, send status, dan context tanpa bergantung ke BSP integration lebih dulu."
      highlights={['Channel log', 'Send status', 'Follow up context', 'Timeline event']}
      relatedLinks={[
        { href: '/app/crm/follow-ups', label: 'Follow ups' },
        { href: '/app/crm/timeline', label: 'Customer timeline' },
      ]}
    />
  );
}
