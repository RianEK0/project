import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { employeeEmploymentTypes, employeeStatuses } from '@nova/shared-types';

@ApiTags('Employees')
@Controller({
  path: 'employees',
  version: '1',
})
export class EmployeesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: employeeStatuses,
      employmentTypes: employeeEmploymentTypes,
      lifecycleSteps: ['Recruit', 'Onboard', 'Develop', 'Retain', 'Offboard'],
    };
  }
}
