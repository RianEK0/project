import { Module } from '@nestjs/common';

import { FiscalYearsController } from './fiscal-years.controller';

@Module({
  controllers: [FiscalYearsController],
})
export class FiscalYearsModule {}
