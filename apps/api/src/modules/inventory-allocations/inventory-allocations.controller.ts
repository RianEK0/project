import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { inventoryAllocationStatuses, inventoryAllocationStrategies } from '@nova/shared-types';

import {
  InventoryAllocationPolicyService,
  type InventoryAllocationPreviewRequest,
} from './inventory-allocation-policy.service';

@ApiTags('Inventory Allocations')
@Controller({
  path: 'inventory-allocations',
  version: '1',
})
export class InventoryAllocationsController {
  constructor(
    private readonly inventoryAllocationPolicyService: InventoryAllocationPolicyService,
  ) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      strategies: inventoryAllocationStrategies,
      statuses: inventoryAllocationStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      blockedStatuses: this.inventoryAllocationPolicyService.getBlockedStatuses(),
      strategies: this.inventoryAllocationPolicyService.getStrategies(),
    };
  }

  @Post('strategy-preview')
  previewStrategy(@Body() body: InventoryAllocationPreviewRequest) {
    return this.inventoryAllocationPolicyService.preview(body);
  }
}
