import { Module } from '@nestjs/common';

import { SupplierQuotationsController } from './supplier-quotations.controller';

@Module({
  controllers: [SupplierQuotationsController],
})
export class SupplierQuotationsModule {}
