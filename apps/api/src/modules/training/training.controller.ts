import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { trainingStatuses } from '@nova/shared-types';

@ApiTags('Training')
@Controller({
  path: 'training',
  version: '1',
})
export class TrainingController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: trainingStatuses,
      deliveryModes: ['Classroom', 'Virtual', 'Blended', 'On-The-Job'],
      complianceTracks: ['Mandatory', 'Role-Based', 'Leadership', 'Certification'],
    };
  }
}
