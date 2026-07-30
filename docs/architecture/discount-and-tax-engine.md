# Discount and Tax Engine Foundation

## Discount Engine

Fondasi ini mengelola evaluasi diskon line, order, customer, dan price list.

Rule type starter:

- `PERCENTAGE`
- `FIXED_AMOUNT`
- `TIERED`
- `BUY_X_GET_Y`
- `MANUAL_OVERRIDE`

## Tax Engine

Fondasi ini menghitung pajak sales dengan mode:

- `EXCLUSIVE`
- `INCLUSIVE`
- `ZERO_RATED`
- `EXEMPT`

## Boundaries

- engine ini fokus pada kalkulasi dan rule starter,
- posting pajak final ke accounting tetap ditunda.
