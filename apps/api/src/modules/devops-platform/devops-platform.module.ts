import { Module } from '@nestjs/common';

import { DevopsPlatformController } from './devops-platform.controller';
import { DevopsPlatformService } from './devops-platform.service';

@Module({
  controllers: [DevopsPlatformController],
  providers: [DevopsPlatformService],
})
export class DevopsPlatformModule {}
