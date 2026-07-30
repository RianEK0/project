# Workflow Automation / Approval Orchestration API Foundation

Endpoint Workflow Automation / Approval Orchestration NovaERP disediakan pada `/api/v1` sebagai foundation layer untuk approval dan orchestration lintas domain.

## Endpoints

- `GET /approval-flows`
- `GET /approval-flows/route-preview`
- `GET /automation-rules`
- `GET /automation-rules/evaluation-preview`
- `GET /automation-triggers`
- `GET /automation-conditions`
- `GET /automation-actions`
- `GET /automation-reminders`
- `GET /automation-webhooks`
- `GET /automation-webhooks/delivery-preview`
- `GET /email-automation`
- `GET /whatsapp-automation`
- `GET /slack-automation`
- `GET /discord-automation`
- `GET /cron-jobs`
- `GET /cron-jobs/schedule-preview`
- `GET /workflow-builder`
- `POST /workflow-builder/preview`
- `GET /rule-engine`
- `POST /rule-engine/preview`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Pada sprint foundation ini, endpoint mengembalikan metadata approval, preview routing, rule evaluation preview, retry policy preview, preview schedule recurring automation, visual workflow composition preview untuk lane drag-and-drop, dan business rule preview untuk IF/THEN automation.

## Boundaries

- Automation foundation tidak menggandakan transaksi domain sumber.
- Output preview bersifat orchestration starter, bukan workflow runtime production penuh.
- Approval, notification, dan recurring actions final tetap akan diperdalam pada sprint lanjutan bersama persistence dan worker runtime.
