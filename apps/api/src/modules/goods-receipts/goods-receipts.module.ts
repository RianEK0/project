import { Module } from '@nestjs/common';

import { GoodsReceiptsController } from './goods-receipts.controller';

@Module({
  controllers: [GoodsReceiptsController],
})
export class GoodsReceiptsModule {}
