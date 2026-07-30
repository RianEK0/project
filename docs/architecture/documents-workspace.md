# Documents Workspace

## Scope

Documents workspace menjadi surface terpusat NovaERP untuk file enterprise, business records, dan governed knowledge tanpa menggandakan workflow transaksi sumber. Sprint ini menyiapkan:

- lane format dokumen untuk PDF, Word, dan Excel,
- business records lane untuk contract dan invoice,
- governance knowledge lane untuk company SOP, manual, training, dan policy,
- preview signal untuk format continuity, traceability record, dan publishing control.

## Design Notes

- Workspace `/app/documents` menjadi titik masuk tunggal untuk dokumen yang perlu dicari, ditinjau, dan dirujuk lintas domain.
- Documents workspace tidak menggantikan invoice, procurement contract, HR training, compliance, atau AI document intelligence; ia menghubungkan semuanya sebagai permukaan dokumen yang lebih governed.
- Preview API dipisah menjadi file formats, business records, dan governance knowledge agar readiness per lane bisa berkembang independen.
- Shared contract menyiapkan capability key, area, status, permission, dan document type untuk evolusi library, retention, acknowledgment, dan controlled publishing berikutnya.

## Frontend Shape

- `/app/documents`
- `/app/documents/pdf`
- `/app/documents/word`
- `/app/documents/excel`
- `/app/documents/contract`
- `/app/documents/invoice`
- `/app/documents/company-sop`
- `/app/documents/manual`
- `/app/documents/training`
- `/app/documents/policy`

## API Shape

- `GET /api/v1/documents-workspace`
- `GET /api/v1/documents-workspace/formats-preview`
- `GET /api/v1/documents-workspace/records-preview`
- `GET /api/v1/documents-workspace/governance-preview`
