import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

export default function SalesTasksPage() {
  return (
    <CrmPlaceholderPage
      eyebrow="Task"
      title="Assign next action to every rep"
      description="Task route ini menyiapkan due date, priority, reminder, dan ownership untuk pekerjaan sales harian."
      highlights={['Due dates', 'Priorities', 'Ownership', 'Completion rate']}
      relatedLinks={[
        { href: '/app/crm/reminders', label: 'Reminders' },
        { href: '/app/crm/follow-ups', label: 'Follow ups' },
      ]}
    />
  );
}
