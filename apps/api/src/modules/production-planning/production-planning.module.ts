import { Module } from '@nestjs/common';

import { ProductionPlanningController } from './production-planning.controller';

@Module({
  controllers: [ProductionPlanningController],
})
export class ProductionPlanningModule {}
