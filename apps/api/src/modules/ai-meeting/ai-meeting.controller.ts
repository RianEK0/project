import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { type AiMeetingType } from '@nova/shared-types';

import { AiMeetingService } from './ai-meeting.service';

type UploadedBinaryFile = {
  originalname?: string;
  mimetype?: string;
  size?: number;
};

@ApiTags('AI Meeting')
@Controller({
  path: 'ai-meeting',
  version: '1',
})
export class AiMeetingController {
  constructor(private readonly aiMeetingService: AiMeetingService) {}

  @Get()
  getFoundation() {
    return this.aiMeetingService.getFoundation();
  }

  @Post('summarize')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  summarize(
    @UploadedFile() file: UploadedBinaryFile,
    @Body('meetingType') meetingType?: AiMeetingType,
  ) {
    return this.aiMeetingService.summarize({
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      sizeBytes: file?.size,
      meetingType,
    });
  }
}
