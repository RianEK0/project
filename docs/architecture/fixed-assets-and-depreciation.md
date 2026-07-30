# Fixed Assets and Depreciation Foundation

Fondasi fixed asset NovaERP menyiapkan register aset, kategori, lifecycle, dan depreciation starter untuk kebutuhan enterprise.

## Scope

- asset register,
- asset category starter,
- in-service dan disposal state,
- depreciation policy dan schedule preview,
- linkage ke cost center, fiscal year, dan financial statement context.

## Design Notes

- Asset register dibedakan dari inventory physical stock karena tujuan finance dan pelaporan berbeda.
- Depreciation starter memprioritaskan metode straight-line untuk preview dan control awal.
- Cost center dan fiscal year diperlukan agar expense recognition dapat dikomposisikan per periode dan unit tanggung jawab.

## Non-Goals

- impairment testing,
- lease accounting penuh,
- maintenance scheduling,
- capitalization workflow multi-stage production.
