import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  goodsIssueStatuses,
  inventoryAllocationStrategies,
  inventoryMovementSourceTypes,
} from '@nova/shared-types';

@ApiTags('Goods Issues')
@Controller({
  path: 'goods-issues',
  version: '1',
})
export class GoodsIssuesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: goodsIssueStatuses,
      sourceTypes: inventoryMovementSourceTypes,
      allocationStrategies: inventoryAllocationStrategies,
    };
  }
}
