import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  goodsReceiptInspectionStatuses,
  goodsReceiptStatuses,
  inventoryMovementSourceTypes,
} from '@nova/shared-types';

@ApiTags('Goods Receipts')
@Controller({
  path: 'goods-receipts',
  version: '1',
})
export class GoodsReceiptsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: goodsReceiptStatuses,
      inspectionStatuses: goodsReceiptInspectionStatuses,
      sourceTypes: inventoryMovementSourceTypes,
    };
  }
}
