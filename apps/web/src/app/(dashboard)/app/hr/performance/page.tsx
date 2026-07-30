import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function PerformancePage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Performance"
      title="Prepare review cycles, calibration, and manager feedback"
      description="Performance foundation menyiapkan review cycle, manager calibration, dan acknowledgement flow untuk memastikan KPI, competency, dan growth discussion punya rumah yang konsisten."
      highlights={[
        'Quarterly and annual review cycles',
        'Calibration and completion states',
        'Manager feedback structure',
        'KPI and training follow-up direction',
      ]}
      relatedLinks={[
        { href: '/app/hr/kpis', label: 'KPI' },
        { href: '/app/hr/training', label: 'Training' },
        { href: '/app/hr/employees', label: 'Employees' },
      ]}
    />
  );
}
