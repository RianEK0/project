import { Module } from '@nestjs/common';

import { AutomationRuleEvaluatorService } from './automation-rule-evaluator.service';
import { AutomationRulesController } from './automation-rules.controller';

@Module({
  controllers: [AutomationRulesController],
  providers: [AutomationRuleEvaluatorService],
})
export class AutomationRulesModule {}
