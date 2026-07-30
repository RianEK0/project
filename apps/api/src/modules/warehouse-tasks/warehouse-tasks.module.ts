import { Module } from '@nestjs/common';

import { WarehouseTasksController } from './warehouse-tasks.controller';

@Module({
  controllers: [WarehouseTasksController],
})
export class WarehouseTasksModule {}
