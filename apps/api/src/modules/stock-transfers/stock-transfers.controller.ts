import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  stockTransferReceiptStatuses,
  stockTransferShipmentStatuses,
  stockTransferStatuses,
  stockTransferTypes,
} from '@nova/shared-types';

@ApiTags('Stock Transfers')
@Controller({
  path: 'stock-transfers',
  version: '1',
})
export class StockTransfersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      transferTypes: stockTransferTypes,
      statuses: stockTransferStatuses,
      shipmentStatuses: stockTransferShipmentStatuses,
      receiptStatuses: stockTransferReceiptStatuses,
    };
  }
}
