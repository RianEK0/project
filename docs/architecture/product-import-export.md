# Product Import Export

Sprint 3A mendukung import dan export master data secara aman, tenant-safe, dan tervalidasi.

## Import Principles

- upload file,
- parse,
- validate,
- preview,
- confirm,
- process,
- result summary.

Opening stock tidak dicampur ke product import default.

## Export Principles

- mengikuti filter halaman,
- membatasi jumlah data besar,
- menghindari CSV injection,
- masking field sensitif seperti cost bila permission tidak cukup.
