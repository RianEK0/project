import { Module } from '@nestjs/common';

import { AiMeetingController } from './ai-meeting.controller';
import { AiMeetingService } from './ai-meeting.service';

@Module({
  controllers: [AiMeetingController],
  providers: [AiMeetingService],
})
export class AiMeetingModule {}
