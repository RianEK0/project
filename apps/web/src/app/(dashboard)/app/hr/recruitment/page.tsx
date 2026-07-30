import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function RecruitmentPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Recruitment"
      title="Track candidates from sourcing to offer and hire decisions"
      description="Recruitment foundation menyediakan stage pipeline, candidate status, dan sourcing channel agar talent acquisition bisa bergerak cepat sebelum omnichannel recruitment automation dibangun."
      highlights={[
        'Sourcing and screening stages',
        'Interview and offer flow',
        'Candidate status visibility',
        'Onboarding handoff direction',
      ]}
      relatedLinks={[
        { href: '/app/hr/employees', label: 'Employees' },
        { href: '/app/hr/departments', label: 'Departments' },
        { href: '/app/hr/organization-chart', label: 'Organization chart' },
      ]}
    />
  );
}
