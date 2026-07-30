# Workflow Automation / Approval Orchestration Foundation

Fondasi Workflow Automation / Approval Orchestration NovaERP menyiapkan lapisan orchestration untuk approval, reminder, webhook, dan recurring workflow di atas bounded context ERP yang sudah ada.

## Scope

- approval flow dan approval request starter,
- automation rule, trigger, condition, dan action foundation,
- reminder dan webhook orchestration starter,
- email, WhatsApp, Slack, dan Discord delivery foundation,
- cron schedule preview untuk recurring workflow,
- workflow builder visual untuk trigger dan action drag-and-drop,
- business rule engine untuk IF/THEN logic lintas inventory, procurement, dan finance.

## Workflow

1. Event bisnis memicu trigger dari perubahan dokumen, approval, reminder, webhook, atau cron.
2. Rule engine mengevaluasi condition terhadap konteks operasional.
3. Jika match, action mengantre approval, reminder, webhook, atau channel notification.
4. Approval flow menentukan approver dan escalation path bila diperlukan.
5. Business rule engine dapat menambahkan threshold-based decisions seperti stock auto-PR atau director approval gate.
6. Workflow builder visual dapat dipakai untuk menyusun urutan trigger dan action sebelum flow dipublish.
7. User kembali ke bounded context asal untuk melakukan keputusan atau aksi final.

## Integration Boundaries

- Procurement, sales, finance, HR, inventory, dan manufacturing tetap menjadi sumber transaksi utama.
- Automation layer hanya mengorkestrasi trigger, matching, routing, reminder, delivery preview, dan rule-decision preview.
- Channel delivery tidak menggantikan inbox, audit log, atau communication history production penuh.
- Cron preview belum menjadi scheduler worker production dengan HA atau delivery guarantee lengkap.

## Non-Goals

- full workflow BPM engine,
- production-grade scheduler cluster,
- third-party connector management lengkap,
- guaranteed exactly-once delivery,
- production-grade visual workflow runtime dengan live worker orchestration dan delivery guarantee penuh.
