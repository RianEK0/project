import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function KpisPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / KPI"
      title="Track targets, cadence, and scorecard health across teams"
      description="KPI foundation memetakan owner, cadence, score band, dan status review agar performance conversation punya baseline yang sama di level employee, department, dan organization."
      highlights={[
        'Monthly, quarterly, and annual cadence',
        'Scorecard approval control',
        'Department and employee alignment',
        'Performance review baseline',
      ]}
      relatedLinks={[
        { href: '/app/hr/performance', label: 'Performance' },
        { href: '/app/hr/departments', label: 'Departments' },
        { href: '/app/hr/organization-chart', label: 'Organization chart' },
      ]}
    />
  );
}
