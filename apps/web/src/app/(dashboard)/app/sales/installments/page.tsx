import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

export default function InstallmentsPage() {
  return (
    <SalesPlaceholderPage
      eyebrow="Installment"
      title="Plan staged payment schedules"
      description="Installment foundation membagi tagihan menjadi termin mingguan, dua mingguan, atau bulanan sebelum AR automation penuh hadir."
      highlights={['Installment count', 'Due dates', 'Frequency', 'Outstanding balance']}
      relatedLinks={[
        { href: '/app/sales/invoices', label: 'Sales invoices' },
        { href: '/app/payments', label: 'Payments' },
      ]}
    />
  );
}
