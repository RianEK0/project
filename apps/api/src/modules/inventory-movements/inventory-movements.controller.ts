import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  inventoryMovementSourceTypes,
  inventoryMovementStatuses,
  inventoryMovementTypes,
} from '@nova/shared-types';

import { InventoryMovementStatusService } from './inventory-movement-status.service';

@ApiTags('Inventory Movements')
@Controller({
  path: 'inventory-movements',
  version: '1',
})
export class InventoryMovementsController {
  constructor(private readonly inventoryMovementStatusService: InventoryMovementStatusService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      movementTypes: inventoryMovementTypes,
      sourceTypes: inventoryMovementSourceTypes,
      statuses: inventoryMovementStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      approvalRequiredTypes: this.inventoryMovementStatusService.getApprovalRequiredTypes(),
      terminalStatuses: this.inventoryMovementStatusService.getTerminalStatuses(),
      transitions: this.inventoryMovementStatusService.getTransitionMatrix(),
    };
  }
}
