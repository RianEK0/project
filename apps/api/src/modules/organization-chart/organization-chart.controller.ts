import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { organizationChartNodeTypes } from '@nova/shared-types';

@ApiTags('Organization Chart')
@Controller({
  path: 'organization-chart',
  version: '1',
})
export class OrganizationChartController {
  @Get()
  listFoundation() {
    return {
      nodes: [],
      nodeTypes: organizationChartNodeTypes,
      layoutModes: ['Department View', 'Reporting Line View', 'Matrix View'],
      linkedContexts: ['Department', 'Employee', 'KPI'],
    };
  }
}
