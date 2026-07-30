import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { goodsReceiptStatuses, purchaseReceiptStatuses } from '@nova/shared-types';

@ApiTags('Purchase Receipts')
@Controller({
  path: 'purchase-receipts',
  version: '1',
})
export class PurchaseReceiptsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: purchaseReceiptStatuses,
      goodsReceiptStatuses,
      receiptEngine: 'goods-receipts',
    };
  }
}
