import { Module } from '@nestjs/common';

import { GoodsIssuesController } from './goods-issues.controller';

@Module({
  controllers: [GoodsIssuesController],
})
export class GoodsIssuesModule {}
