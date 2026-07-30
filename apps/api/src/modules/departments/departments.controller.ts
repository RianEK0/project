import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { departmentStatuses } from '@nova/shared-types';

@ApiTags('Departments')
@Controller({
  path: 'departments',
  version: '1',
})
export class DepartmentsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: departmentStatuses,
      hierarchyLevels: ['Corporate', 'Division', 'Department', 'Team'],
      linkedViews: ['Employees', 'KPI', 'Organization Chart'],
    };
  }
}
