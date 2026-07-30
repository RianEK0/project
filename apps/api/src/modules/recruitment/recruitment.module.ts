import { Module } from '@nestjs/common';

import { RecruitmentController } from './recruitment.controller';

@Module({
  controllers: [RecruitmentController],
})
export class RecruitmentModule {}
