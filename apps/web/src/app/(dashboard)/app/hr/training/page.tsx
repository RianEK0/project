import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function TrainingPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Training"
      title="Coordinate learning programs, compliance tracks, and capability growth"
      description="Training foundation menjadi katalog awal untuk mandatory learning, role-based development, dan certification tracking yang dapat dihubungkan ke KPI dan performance review."
      highlights={[
        'Classroom, virtual, and blended modes',
        'Mandatory and leadership tracks',
        'Program publishing workflow',
        'Performance follow-up linkage',
      ]}
      relatedLinks={[
        { href: '/app/hr/performance', label: 'Performance' },
        { href: '/app/hr/kpis', label: 'KPI' },
        { href: '/app/hr/employees', label: 'Employees' },
      ]}
    />
  );
}
