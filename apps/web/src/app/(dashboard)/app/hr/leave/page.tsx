import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function LeavePage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Leave"
      title="Route leave requests through balance, approval, and payroll awareness"
      description="Leave foundation memusatkan entitlement, carry forward, pending approval, dan remaining balance agar manager dan HR dapat memproses cuti tanpa spreadsheet terpisah."
      highlights={[
        'Leave type catalog starter',
        'Balance preview with pending requests',
        'Manager and HR approval lane',
        'Payroll awareness for unpaid leave',
      ]}
      relatedLinks={[
        { href: '/app/hr/attendance', label: 'Attendance' },
        { href: '/app/hr/payroll', label: 'Payroll' },
        { href: '/app/hr/employees', label: 'Employees' },
      ]}
    />
  );
}
