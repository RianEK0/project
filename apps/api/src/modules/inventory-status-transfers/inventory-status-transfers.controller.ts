import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { inventoryBalanceStatuses, inventoryStatusTransferStatuses } from '@nova/shared-types';

@ApiTags('Inventory Status Transfers')
@Controller({
  path: 'inventory-status-transfers',
  version: '1',
})
export class InventoryStatusTransfersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: inventoryStatusTransferStatuses,
      balanceStatuses: inventoryBalanceStatuses,
    };
  }
}
