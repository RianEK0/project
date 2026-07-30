import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function AttendancePage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Attendance"
      title="Capture presence, lateness, and overtime with shift-aware rules"
      description="Attendance starter menyiapkan capture method, grace period, overtime visibility, dan sinkronisasi dasar ke leave dan payroll sebelum automation device integration dibangun lebih dalam."
      highlights={[
        'Shift-linked attendance policy',
        'Late and overtime preview',
        'Manual, kiosk, and web capture modes',
        'Payroll cut-off readiness',
      ]}
      relatedLinks={[
        { href: '/app/hr/shifts', label: 'Shifts' },
        { href: '/app/hr/leave', label: 'Leave' },
        { href: '/app/hr/payroll', label: 'Payroll' },
      ]}
    />
  );
}
