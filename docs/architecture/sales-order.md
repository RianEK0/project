# Sales Order Foundation

## Sales Order

Sales order merepresentasikan komitmen komersial yang sudah siap dipenuhi.

Status utama:

- `DRAFT`
- `PENDING_APPROVAL`
- `APPROVED`
- `ALLOCATED`
- `PARTIALLY_DELIVERED`
- `DELIVERED`
- `PARTIALLY_INVOICED`
- `INVOICED`
- `COMPLETED`
- `REJECTED`
- `CANCELLED`

## Source Types

- `DIRECT`
- `CRM_QUOTATION`
- `CONTRACT`
- `BACKORDER`
- `MANUAL`

## Notes

- sales order dapat berasal dari quotation CRM atau input direct,
- fulfillment fisik tetap dijalankan oleh warehouse foundation yang sudah ada.
