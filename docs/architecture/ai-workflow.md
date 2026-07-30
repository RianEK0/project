# AI / Intelligence Workspace Foundation

Fondasi AI / Intelligence Workspace NovaERP menambahkan lapisan copilot lintas domain di atas bounded context ERP yang sudah ada tanpa menjadikan AI sebagai sumber data utama.

## Scope

- Chat ERP untuk routing pertanyaan lintas domain,
- Ask Inventory, Ask Finance, dan Ask CRM starter,
- natural-language search planner,
- AI report, AI forecast, dan AI recommendation preview,
- AI domain copilots untuk procurement, sales, accounting, HR, manufacturing, dan analytics,
- AI dashboard, AI chat, dan predictive analytics command center,
- AI Copilot untuk menjawab permintaan natural-language dengan query aman, tabel, grafik, ringkasan, dan draft action,
- demand forecasting, fraud detection, dan cash-flow prediction signal lane,
- inventory, procurement, sales, dan warehouse optimization lane,
- AI Vision perception lane untuk scan rak, scan gudang, absensi wajah, dan PPE detection,
- document OCR upload, invoice extraction, receipt extraction, document review untuk contract/agreement/NDA/purchase order/invoice, voice assistant, dan meeting summary lane.

## Workflow

1. User memulai dari pertanyaan bebas melalui Chat ERP atau natural-language search.
2. Orkestrator mengklasifikasikan domain utama, insight type, dan mode eksekusi.
3. Domain copilot membaca metadata bounded context yang relevan tanpa menggandakan data master.
4. AI report, forecast, atau recommendation membentuk output ringkas untuk user.
5. Workflow document intelligence, perception, assistants, atau AI Copilot menangkap konteks tambahan seperti OCR upload, camera scan, structured document review, transcript, audio meeting, safe query plan, export suggestion, atau follow-up actions bila dibutuhkan.
6. User diarahkan kembali ke workspace domain yang tepat untuk aksi operasional final.

## Integration Boundaries

- Inventory, procurement, finance, CRM, sales, HR, dan manufacturing tetap menjadi sumber transaksi dan master data.
- Documents workspace menjadi rumah governed untuk PDF, Word, Excel, contract, invoice, SOP, manual, training, dan policy; AI document intelligence hanya menambahkan OCR, extraction, dan analysis layer.
- AI workspace hanya memberi routing, planning, summary, preview forecast, recommendation starter, perception signals, dan control plane untuk document intelligence maupun assistants.
- Search dan copilot tidak menggantikan approval, posting, receiving, payroll, atau produksi aktual.
- Analytics tetap menjadi bounded context untuk metrik; AI analytics menambahkan packaging dan narrative layer.

## Non-Goals

- autonomous decision making tanpa approval manusia,
- full LLM orchestration production-grade,
- vector search atau embedding infrastructure production,
- external model gateway dan billing metering,
- compliance archive untuk prompt/response production lengkap,
- autonomous document posting atau contract approval tanpa review manusia.
