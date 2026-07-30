import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { stockAdjustmentStatuses, stockAdjustmentTypes } from '@nova/shared-types';

@ApiTags('Stock Adjustments')
@Controller({
  path: 'stock-adjustments',
  version: '1',
})
export class StockAdjustmentsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      adjustmentTypes: stockAdjustmentTypes,
      statuses: stockAdjustmentStatuses,
    };
  }
}
