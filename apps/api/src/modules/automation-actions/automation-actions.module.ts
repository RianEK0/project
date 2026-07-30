import { Module } from '@nestjs/common';

import { AutomationActionsController } from './automation-actions.controller';

@Module({
  controllers: [AutomationActionsController],
})
export class AutomationActionsModule {}
