import { Module } from '@nestjs/common';

import { StockCountWorkflowService } from './stock-count-workflow.service';
import { StockCountController } from './stock-count.controller';

@Module({
  controllers: [StockCountController],
  providers: [StockCountWorkflowService],
  exports: [StockCountWorkflowService],
})
export class StockCountModule {}
