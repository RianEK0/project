import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function ShiftsPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Shift"
      title="Publish shift templates and roster rules for daily operations"
      description="Shift foundation membantu tim HR dan operasional mengelola roster pagi, malam, fleksibel, dan coverage lintas unit sebelum scheduling engine yang lebih granular diperluas."
      highlights={[
        'Shift template catalog',
        'Publish and archive controls',
        'Overlap and coverage awareness',
        'Attendance linkage starter',
      ]}
      relatedLinks={[
        { href: '/app/hr/attendance', label: 'Attendance' },
        { href: '/app/hr/employees', label: 'Employees' },
        { href: '/app/hr/departments', label: 'Departments' },
      ]}
    />
  );
}
