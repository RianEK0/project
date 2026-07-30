# ADR 022: Customer Timeline Composes Sales Events

## Status

Accepted

## Decision

Customer timeline untuk CRM/Sales dibangun sebagai agregasi event dari lead, opportunity, quotation, deal, dan activity stream, bukan sebagai sumber data tunggal yang berdiri sendiri.

## Consequences

- tiap domain sales tetap memiliki lifecycle sendiri,
- timeline dapat diperluas ke helpdesk atau billing event di sprint berikutnya,
- query timeline menjadi boundary baca, bukan tempat write utama.
