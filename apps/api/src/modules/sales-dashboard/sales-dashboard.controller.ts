import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesDashboardPeriods } from '@nova/shared-types';

@ApiTags('Sales Dashboard')
@Controller({
  path: 'sales-dashboard',
  version: '1',
})
export class SalesDashboardController {
  @Get()
  getDashboard() {
    return {
      periods: salesDashboardPeriods,
      cards: [
        {
          id: 'new-leads',
          label: 'New Leads',
          route: '/app/crm/leads',
          insight: 'Track inbound lead creation before qualification.',
        },
        {
          id: 'active-opportunities',
          label: 'Active Opportunities',
          route: '/app/crm/opportunities',
          insight: 'Watch open commercial motion across discovery to negotiation.',
        },
        {
          id: 'open-quotations',
          label: 'Open Quotations',
          route: '/app/crm/quotations',
          insight: 'Follow proposal response and commercial negotiation progress.',
        },
        {
          id: 'weighted-pipeline',
          label: 'Weighted Pipeline',
          route: '/app/crm/pipeline',
          insight: 'Estimate likely revenue without waiting for accounting close.',
        },
      ],
    };
  }
}
