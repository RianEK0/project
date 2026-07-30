import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AiSalesPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Sales"
      title="Review delivery, invoicing, and collection momentum with guided recaps"
      description="AI Sales foundation menyatukan sales order, delivery, shipment, invoice, return, installment, dan analytics signal agar order-to-cash leadership bisa membaca situasi komersial dengan cepat."
      highlights={[
        'Order-to-cash signal recap',
        'Collection and delay forecasting',
        'Fulfillment escalation prompts',
        'Revenue-side action prioritization',
      ]}
      relatedLinks={[
        { href: '/app/sales', label: 'Sales' },
        { href: '/app/ai/reports', label: 'AI report' },
        { href: '/app/ai/forecast', label: 'AI forecast' },
      ]}
    />
  );
}
