# FIFO and FEFO

Sprint 3B memakai strategi allocation deterministik.

## FIFO

- default untuk stock non-expiration atau lot-tracked biasa,
- memilih stok paling lama valid.

## FEFO

- default untuk product yang melacak expiration,
- memilih expiration paling dekat yang belum expired,
- fallback ke FIFO untuk lot tanpa expiration.
