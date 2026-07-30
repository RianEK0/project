import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { stockCountScopeTypes, stockCountStatuses, stockCountTypes } from '@nova/shared-types';

import { StockCountWorkflowService } from './stock-count-workflow.service';

@ApiTags('Stock Counts')
@Controller({
  path: 'stock-counts',
  version: '1',
})
export class StockCountController {
  constructor(private readonly stockCountWorkflowService: StockCountWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      countTypes: stockCountTypes,
      scopeTypes: stockCountScopeTypes,
      statuses: stockCountStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      freezeBlockingStatuses: this.stockCountWorkflowService.getFreezeBlockingStatuses(),
      transitions: this.stockCountWorkflowService.getTransitionMatrix(),
    };
  }
}
