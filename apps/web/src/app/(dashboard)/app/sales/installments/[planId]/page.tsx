import { SalesPlaceholderPage } from '@/features/sales/sales-placeholder-page';

type InstallmentPlanDetailPageProps = {
  params: Promise<{
    planId: string;
  }>;
};

export default async function InstallmentPlanDetailPage({
  params,
}: InstallmentPlanDetailPageProps) {
  const { planId } = await params;

  return (
    <SalesPlaceholderPage
      eyebrow="Installment Detail"
      title={`Installment Plan ${planId}`}
      description="Detail installment plan akan menampilkan schedule termin, pembayaran yang sudah masuk, dan risiko overdue."
      highlights={['Schedule', 'Paid installments', 'Outstanding balance', 'Overdue risk']}
      relatedLinks={[
        { href: '/app/sales/invoices', label: 'Sales invoices' },
        { href: '/app/payments', label: 'Payments' },
      ]}
    />
  );
}
