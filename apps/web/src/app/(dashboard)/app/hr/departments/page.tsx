import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function DepartmentsPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Department"
      title="Model department hierarchy and ownership across the organization"
      description="Department foundation menjadi dasar untuk struktur organisasi, headcount ownership, KPI grouping, serta reporting line yang dipakai ulang oleh payroll, performance, dan org chart."
      highlights={[
        'Division and team hierarchy',
        'Manager ownership starter',
        'Headcount grouping direction',
        'KPI and org chart linkage',
      ]}
      relatedLinks={[
        { href: '/app/hr/employees', label: 'Employees' },
        { href: '/app/hr/kpis', label: 'KPI' },
        { href: '/app/hr/organization-chart', label: 'Organization chart' },
      ]}
    />
  );
}
