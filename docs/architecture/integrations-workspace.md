# Integrations Workspace

## Scope

Integrations workspace menjadi control plane NovaERP untuk provider eksternal yang dipakai lintas bounded context. Sprint ini menyiapkan:

- payment gateway readiness untuk Stripe, Xendit, dan Midtrans,
- productivity suite lane untuk Google dan Microsoft,
- messaging connector lane untuk WhatsApp, Telegram, Slack, dan Discord,
- storage connector lane untuk Dropbox, Google Drive, OneDrive, dan S3,
- AI provider lane untuk OpenAI, Claude, dan Gemini.

## Design Notes

- Workspace `/app/integrations` menjadi titik masuk tunggal untuk provider connection matrix dan readiness signal.
- Integrations workspace tidak menggandakan logic domain pada payment, CRM, automation, portal, atau AI workspace.
- Setiap kategori provider memiliki preview API sendiri agar status, coverage, dan next focus bisa berkembang tanpa mengubah seluruh workspace.
- Kontrak shared types menyiapkan category, provider key, auth mode, connection status, permission, dan document type untuk evolusi connector management berikutnya.

## Frontend Shape

- `/app/integrations`
- `/app/integrations/stripe`
- `/app/integrations/xendit`
- `/app/integrations/midtrans`
- `/app/integrations/google`
- `/app/integrations/microsoft`
- `/app/integrations/whatsapp`
- `/app/integrations/telegram`
- `/app/integrations/slack`
- `/app/integrations/discord`
- `/app/integrations/dropbox`
- `/app/integrations/google-drive`
- `/app/integrations/onedrive`
- `/app/integrations/s3`
- `/app/integrations/openai`
- `/app/integrations/claude`
- `/app/integrations/gemini`

## API Shape

- `GET /api/v1/integrations-workspace`
- `GET /api/v1/integrations-workspace/payments-preview`
- `GET /api/v1/integrations-workspace/suite-preview`
- `GET /api/v1/integrations-workspace/messaging-preview`
- `GET /api/v1/integrations-workspace/storage-preview`
- `GET /api/v1/integrations-workspace/ai-preview`
