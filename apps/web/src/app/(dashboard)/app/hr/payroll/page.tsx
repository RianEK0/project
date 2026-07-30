import { HrPlaceholderPage } from '@/features/hr/hr-placeholder-page';

export default function PayrollPage() {
  return (
    <HrPlaceholderPage
      eyebrow="HR / Payroll"
      title="Prepare payroll cycles, approvals, and payout-ready totals"
      description="Payroll foundation menyiapkan cut-off, gross-to-net preview, approval control, dan kesiapan handoff ke finance tanpa membangun journal posting payroll production penuh di sprint ini."
      highlights={[
        'Monthly, weekly, and biweekly cycles',
        'Allowance and deduction visibility',
        'Approval and posting checkpoints',
        'Finance handoff direction',
      ]}
      relatedLinks={[
        { href: '/app/hr/attendance', label: 'Attendance' },
        { href: '/app/hr/leave', label: 'Leave' },
        { href: '/app/finance/banks', label: 'Finance banks' },
      ]}
    />
  );
}
