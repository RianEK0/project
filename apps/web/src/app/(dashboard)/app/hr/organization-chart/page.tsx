import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function OrganizationChartPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Organization Chart"
      title="Visualize reporting line, department structure, and matrix visibility"
      description="Organization chart starter menampilkan fondasi view untuk company, division, department, team, position, dan employee node agar struktur organisasi bisa dibaca lebih cepat lintas fungsi."
      highlights={[
        'Department and reporting line views',
        'Matrix visibility starter',
        'Position and employee node support',
        'Department and KPI linkage',
      ]}
      relatedLinks={[
        { href: '/app/hr/departments', label: 'Departments' },
        { href: '/app/hr/employees', label: 'Employees' },
        { href: '/app/hr/kpis', label: 'KPI' },
      ]}
    />
  );
}
