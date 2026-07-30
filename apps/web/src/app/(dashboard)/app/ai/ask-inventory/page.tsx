import { AiPlaceholderPage } from '@/features/ai/ai-placeholder-page';

export default function AskInventoryPage() {
  return (
    <AiPlaceholderPage
      eyebrow="AI / Ask Inventory"
      title="Ask stock, warehouse, lot, and serial questions in a focused assistant lane"
      description="Ask Inventory foundation mengarahkan pertanyaan operasional ke stok, lokasi, lot, serial, reservation, dan replenishment signal agar warehouse dan planner bisa membaca kondisi tanpa menyusun filter manual terlebih dahulu."
      highlights={[
        'Warehouse and stock lookup prompts',
        'Lot and serial trace starter',
        'Reorder and shortage signal questions',
        'Inventory issue triage support',
      ]}
      relatedLinks={[
        { href: '/app/inventory', label: 'Inventory' },
        { href: '/app/warehouse-operations', label: 'Warehouse operations' },
        { href: '/app/ai/chat-erp', label: 'Chat ERP' },
      ]}
    />
  );
}
