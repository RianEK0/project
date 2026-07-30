import { Module } from '@nestjs/common';

import { SalesMeetingsController } from './sales-meetings.controller';
import { SalesTasksController } from './sales-tasks.controller';

@Module({
  controllers: [SalesTasksController, SalesMeetingsController],
})
export class SalesExecutionModule {}
