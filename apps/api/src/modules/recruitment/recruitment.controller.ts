import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { candidateStatuses, recruitmentStages } from '@nova/shared-types';

@ApiTags('Recruitment')
@Controller({
  path: 'recruitment',
  version: '1',
})
export class RecruitmentController {
  @Get()
  listFoundation() {
    return {
      items: [],
      stages: recruitmentStages,
      candidateStatuses,
      sourcingChannels: ['Referral', 'Job Board', 'LinkedIn', 'Campus', 'Agency'],
    };
  }
}
