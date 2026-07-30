import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function EmployeesPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Employee"
      title="Keep employee records, lifecycle status, and employment context in one place"
      description="Employee foundation menyiapkan master data karyawan untuk onboarding, employment type, status, dan keterkaitannya ke attendance, payroll, performance, dan organization chart."
      highlights={[
        'Employment type and status model',
        'Onboarding and offboarding visibility',
        'Department and reporting assignment',
        'Cross-link to attendance and payroll',
      ]}
      relatedLinks={[
        { href: '/app/hr/departments', label: 'Departments' },
        { href: '/app/hr/payroll', label: 'Payroll' },
        { href: '/app/hr/organization-chart', label: 'Organization chart' },
      ]}
    />
  );
}
