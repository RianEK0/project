# ADR 024: Sales Quotation Shared Between CRM and Order-to-Cash

## Status

Accepted

## Decision

Sales quotation tetap menjadi domain bersama antara CRM dan Sales / Order-to-Cash, bukan dibuat dua model terpisah.

## Consequences

- quotation yang sama dapat dipakai untuk negotiation dan conversion ke sales order,
- permission dan workflow quotation tetap terpusat,
- frontend dapat menampilkan quotation pada area CRM maupun Sales tanpa menduplikasi lifecycle.
