import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function CallLogsPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Call Log"
      title="Record every outbound and inbound call"
      description="Call log foundation menyimpan outcome, callback need, dan signal minat prospek."
      highlights={['Call outcome', 'Duration', 'Callback request', 'Rep performance']}
      relatedLinks={[
        { href: '/app/crm/activities', label: 'Activity feed' },
        { href: '/app/crm/reminders', label: 'Reminders' },
      ]}
    />
  );
}
