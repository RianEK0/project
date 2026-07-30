import { Module } from '@nestjs/common';

import { PlatformExperienceService } from './platform-experience.service';
import { PlatformIdentityService } from './platform-identity.service';
import { PlatformTopologyService } from './platform-topology.service';
import { PlatformWorkspaceController } from './platform-workspace.controller';

@Module({
  controllers: [PlatformWorkspaceController],
  providers: [PlatformTopologyService, PlatformExperienceService, PlatformIdentityService],
})
export class PlatformWorkspaceModule {}
