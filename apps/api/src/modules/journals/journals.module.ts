import { Module } from '@nestjs/common';

import { JournalPostingService } from './journal-posting.service';
import { JournalsController } from './journals.controller';

@Module({
  controllers: [JournalsController],
  providers: [JournalPostingService],
})
export class JournalsModule {}
