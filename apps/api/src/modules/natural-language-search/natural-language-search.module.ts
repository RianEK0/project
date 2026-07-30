import { Module } from '@nestjs/common';

import { NaturalLanguageSearchController } from './natural-language-search.controller';
import { NaturalLanguageQueryPlannerService } from './natural-language-query-planner.service';

@Module({
  controllers: [NaturalLanguageSearchController],
  providers: [NaturalLanguageQueryPlannerService],
})
export class NaturalLanguageSearchModule {}
