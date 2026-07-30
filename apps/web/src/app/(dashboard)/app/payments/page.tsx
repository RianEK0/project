import { SectionPlaceholder } from '@/features/sprint-two/section-placeholder';

export default function PaymentsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Payment Records"
      title="Manual payment capture and verification"
      description="Sprint 2 belum mengaktifkan payment gateway, tetapi sudah menyiapkan payment record manual yang bisa mengubah saldo invoice dan booking secara terkendali dalam transaction."
      highlights={[
        'Manual payment methods',
        'Verification states',
        'Proof and reference tracking',
        'Invoice and booking balance sync',
      ]}
    />
  );
}
