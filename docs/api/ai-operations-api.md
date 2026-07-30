# AI / Intelligence Workspace API Foundation

Endpoint AI / Intelligence Workspace NovaERP disediakan pada `/api/v1` sebagai foundation layer untuk copilot lintas domain.

## Endpoints

- `GET /ai-workspace`
- `GET /ai-workspace/command-center-preview`
- `GET /ai-workspace/forecast-risk-preview`
- `GET /ai-workspace/optimization-preview`
- `GET /ai-workspace/document-intelligence-preview`
- `GET /ai-workspace/perception-preview`
- `GET /ai-workspace/assistants-preview`
- `GET /chat-erp`
- `GET /chat-erp/route-preview`
- `GET /ask-inventory`
- `GET /ask-finance`
- `GET /ask-crm`
- `GET /natural-language-search`
- `GET /natural-language-search/plan-preview`
- `GET /ai-reports`
- `GET /ai-forecast`
- `GET /ai-forecast/preview`
- `GET /ai-recommendations`
- `GET /ai-recommendations/priority-preview`
- `GET /ai-copilot`
- `POST /ai-copilot/preview`
- `GET /ai-document-ocr`
- `POST /ai-document-ocr/extract`
- `GET /ai-document-review`
- `POST /ai-document-review/analyze`
- `GET /ai-vision`
- `POST /ai-vision/scan`
- `GET /ai-voice`
- `POST /ai-voice/execute-preview`
- `GET /ai-meeting`
- `POST /ai-meeting/summarize`
- `GET /ai-procurement`
- `GET /ai-sales`
- `GET /ai-accounting`
- `GET /ai-hr`
- `GET /ai-manufacturing`
- `GET /ai-analytics`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Pada sprint foundation ini, endpoint mengembalikan metadata assistant, routing preview, query plan preview, workspace capability preview, perception preview, forecast preview, recommendation ranking, domain copilot starter, AI Copilot safe-query preview, multipart upload preview untuk OCR, AI Vision, dan AI Meeting, serta structured command preview untuk AI Voice.

## Boundaries

- AI workspace tidak menggandakan transaksi domain sumber.
- Output preview bersifat assistive dan belum menjadi automation engine penuh.
- Document intelligence, AI Vision, dan meeting/voice assistants tetap mengandalkan review manusia sebelum aksi final yang sensitif.
- Aksi final tetap dilakukan pada bounded context asal seperti procurement, sales, finance, HR, inventory, atau manufacturing.
