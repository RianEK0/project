import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  goodsReceiptStatuses,
  inventoryMovementStatuses,
  inventoryMovementTypes,
  stockCountStatuses,
  stockTransferStatuses,
} from '@nova/shared-types';

@ApiTags('Inventory Movement Analytics')
@Controller({
  path: 'inventory-movement-analytics',
  version: '1',
})
export class InventoryMovementAnalyticsController {
  @Get('dashboard')
  getDashboard() {
    return {
      summary: {
        movementTypes: inventoryMovementTypes.length,
        movementStatuses: inventoryMovementStatuses.length,
        receiptStages: goodsReceiptStatuses.length,
        transferStages: stockTransferStatuses.length,
        stockCountStages: stockCountStatuses.length,
      },
      dashboards: [
        {
          id: 'inbound-flow',
          label: 'Inbound Flow',
          description: 'Receipt, inspection, and putaway handoff coverage for Sprint 3B.',
        },
        {
          id: 'outbound-flow',
          label: 'Outbound Flow',
          description: 'Allocation, picking, packing, dispatch, and issue orchestration readiness.',
        },
        {
          id: 'control-tower',
          label: 'Control Tower',
          description:
            'Movement approvals, reversals, count freeze, and scan resolution guard rails.',
        },
      ],
    };
  }
}
