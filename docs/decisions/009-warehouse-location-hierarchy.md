# ADR 009: Warehouse Location Hierarchy

## Status

Accepted

## Decision

Warehouse hierarchy Sprint 3A dibangun sebagai `Warehouse -> WarehouseZone -> StorageLocation`, dengan `StorageLocation` yang dapat memiliki parent-child dalam warehouse yang sama.

## Rationale

- cukup fleksibel untuk rack, shelf, bin, dan room,
- tidak menggandakan model `Location` bisnis dari Sprint 2,
- siap untuk flow transfer dan picking berikutnya.
