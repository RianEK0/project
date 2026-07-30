import { Module } from '@nestjs/common';

import { OrganizationChartController } from './organization-chart.controller';

@Module({
  controllers: [OrganizationChartController],
})
export class OrganizationChartModule {}
