import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Inventory Movement Reports')
@Controller({
  path: 'inventory-movement-reports',
  version: '1',
})
export class InventoryMovementReportsController {
  @Get('catalog')
  getCatalog() {
    return {
      reports: [
        {
          id: 'movement-ledger',
          label: 'Movement Ledger',
          description: 'Append-only ledger export grouped by document, lot, and serial.',
        },
        {
          id: 'warehouse-productivity',
          label: 'Warehouse Productivity',
          description: 'Task throughput, picking output, and count execution trend starter.',
        },
        {
          id: 'allocation-performance',
          label: 'Allocation Performance',
          description: 'FIFO, FEFO, and manual allocation behaviour preview for Sprint 3B.',
        },
      ],
    };
  }
}
