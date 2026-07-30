import { Module } from '@nestjs/common';

import { InventoryAllocationPolicyService } from './inventory-allocation-policy.service';
import { InventoryAllocationsController } from './inventory-allocations.controller';

@Module({
  controllers: [InventoryAllocationsController],
  providers: [InventoryAllocationPolicyService],
  exports: [InventoryAllocationPolicyService],
})
export class InventoryAllocationsModule {}
