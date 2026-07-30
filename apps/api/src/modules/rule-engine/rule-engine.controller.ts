import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RuleEngineService } from './rule-engine.service';

type RuleEnginePreviewBody = {
  ruleName?: string;
  factType?: string;
  operator?: string;
  threshold?: number;
  actionType?: string;
  evaluationMode?: string;
  actionTarget?: string;
};

@ApiTags('Rule Engine')
@Controller({
  path: 'rule-engine',
  version: '1',
})
export class RuleEngineController {
  constructor(private readonly ruleEngineService: RuleEngineService) {}

  @Get()
  getFoundation() {
    return this.ruleEngineService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: RuleEnginePreviewBody) {
    return this.ruleEngineService.preview(body);
  }
}
