import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesAnalyticsPeriods } from '@nova/shared-types';

import { SalesAnalyticsService } from './sales-analytics.service';

@ApiTags('Sales Analytics')
@Controller({
  path: 'sales-analytics',
  version: '1',
})
export class SalesAnalyticsController {
  constructor(private readonly salesAnalyticsService: SalesAnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    const summary = this.salesAnalyticsService.summarize({
      orderCount: 12,
      deliveredCount: 10,
      invoicedCount: 9,
      returnedCount: 1,
      collectedAmount: 9000000,
      invoicedAmount: 12000000,
      openOrderValue: 15000000,
      overdueReceivable: 2500000,
    });

    return {
      periods: salesAnalyticsPeriods,
      summary,
      cards: [
        {
          id: 'open-orders',
          label: 'Open Orders',
          route: '/app/sales/orders',
          metric: summary.openOrderValue,
        },
        {
          id: 'fill-rate',
          label: 'Fill Rate',
          route: '/app/sales/delivery-orders',
          metric: summary.fillRate,
        },
        {
          id: 'collection-rate',
          label: 'Collection Rate',
          route: '/app/sales/invoices',
          metric: summary.collectionRate,
        },
        {
          id: 'return-rate',
          label: 'Return Rate',
          route: '/app/sales/returns',
          metric: summary.returnRate,
        },
      ],
    };
  }
}
